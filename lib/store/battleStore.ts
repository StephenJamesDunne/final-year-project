import { create } from 'zustand';
import { BattleState } from '../types/game';

// Import game modules
import { createMinion, checkGameOver, calculateCombatDamage, updateMinionHealth, enableMinionAttacks, disableMinionAttack, removeDead, incrementTurn } from '../game/gameLogic';
import { createStartingDeck, drawCards, removeCardFromHand, addCardsToHand } from '../game/deckManager';
import { processAbilities, processDeathrattles, processEndOfTurnEffects } from '../game/abilitySystem';
import { getAIAction, executeAIPlayCard, executeAIAttacks, getAIDecisionDelay } from '../game/aiPlayer';

interface BattleStore extends BattleState {
  playCard: (cardIndex: number, targetId?: string) => void;
  attack: (attackerId: string, targetId: string) => void;
  endTurn: () => void;
  resetBattle: () => void;
}

function createInitialState(): BattleState {
  const playerDeck = createStartingDeck();
  const aiDeck = createStartingDeck();

  const playerDraw = drawCards(playerDeck, 4);
  const aiDraw = drawCards(aiDeck, 4);

  return {
    player: {
      health: 30,
      mana: 1,
      maxMana: 1,
      hand: playerDraw.drawn,
      board: [],
      deck: playerDraw.remaining,
    },
    ai: {
      health: 30,
      mana: 1,
      maxMana: 1,
      hand: aiDraw.drawn,
      board: [],
      deck: aiDraw.remaining,
    },
    currentTurn: 'player',
    turnNumber: 1,
    gameOver: false,
    combatLog: ["The sound of battle roars across the Five Realms!"],
    aiAction: undefined,
  };
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  ...createInitialState(),

  playCard: (cardIndex: number, targetId?: string) => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    const card = state.player.hand[cardIndex];
    if (!card || card.manaCost > state.player.mana) return;

    let newState: BattleState = {
      player: { ...state.player },
      ai: { ...state.ai },
      currentTurn: state.currentTurn,
      turnNumber: state.turnNumber,
      gameOver: state.gameOver,
      winner: state.winner,
      combatLog: [...state.combatLog],
      aiAction: state.aiAction,
    };

    // Remove card from hand and reduce mana
    newState.player = {
      ...newState.player,
      hand: removeCardFromHand(newState.player.hand, cardIndex),
      mana: newState.player.mana - card.manaCost,
    };

    if (card.type === 'minion') {
      const minion = createMinion(card);
      newState.player.board = [...newState.player.board, minion];
    }

    // Process abilities
    newState = processAbilities(card, 'battlecry', newState, true);
    set(newState);
  },

  attack: (attackerId: string, targetId: string) => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    const attacker = state.player.board.find(m => m.instanceId === attackerId);
    if (!attacker || !attacker.canAttack) return;

    // Clone state for modifications
    let newState: BattleState = {
      player: { ...state.player },
      ai: { ...state.ai },
      currentTurn: state.currentTurn,
      turnNumber: state.turnNumber,
      gameOver: state.gameOver,
      winner: state.winner,
      combatLog: [...state.combatLog],
      aiAction: state.aiAction,
    };

    if (targetId === 'face') {
      // Attack enemy hero
      newState.ai.health -= attacker.attack;
      newState.player.board = disableMinionAttack(newState.player.board, attackerId);

      const gameResult = checkGameOver(newState.player.health, newState.ai.health);
      Object.assign(newState, gameResult);

    } else {
      // Attack enemy minion
      const target = newState.ai.board.find(m => m.instanceId === targetId);
      if (!target) return;

      const combatResult = calculateCombatDamage(attacker, target);

      // Update minion health
      if (combatResult.attackerSurvives) {
        newState.player.board = newState.player.board.map(m =>
          m.instanceId === attackerId
            ? updateMinionHealth(m, combatResult.attackerNewHealth)
            : m
        );
      }

      if (combatResult.targetSurvives) {
        newState.ai.board = newState.ai.board.map(m =>
          m.instanceId === targetId
            ? updateMinionHealth(m, combatResult.targetNewHealth)
            : m
        );
      }

      // Process deathrattles for dying minions
      if (!combatResult.targetSurvives && target.abilities) {
        newState = processAbilities(target, 'deathrattle', newState, false);
      }
      if (!combatResult.attackerSurvives && attacker.abilities) {
        newState = processAbilities(attacker, 'deathrattle', newState, true);
      }

      // Remove dead minions
      newState.player.board = removeDead(newState.player.board);
      newState.ai.board = removeDead(newState.ai.board);
    }

    set(newState);
  },

  endTurn: async () => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    // Switch to AI turn
    set({ ...state, currentTurn: 'ai' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    let newState: BattleState = { ...state, currentTurn: 'ai' };
    let currentLog = [...newState.combatLog];

    // Process end of turn effects for player minions
    newState = processEndOfTurnEffects(newState.player.board, newState, true);

    // AI Decision Making
    const aiAction = getAIAction(newState.ai, newState);

    if (aiAction.type === 'play_card' && aiAction.cardIndex !== undefined) {
      const result = executeAIPlayCard(aiAction.cardIndex, newState);
      newState = result.newState;
      currentLog.push(result.logMessage);

      // Show AI action
      set({
        ...newState,
        combatLog: currentLog,
        aiAction: result.actionMessage,
      });
      await new Promise(resolve => setTimeout(resolve, getAIDecisionDelay()));

      // Log battlecry effects if any
      const playedCard = newState.ai.hand[aiAction.cardIndex] || result.newState.ai.board[result.newState.ai.board.length - 1];
      if (playedCard?.abilities?.some(a => a.trigger === 'battlecry')) {
        currentLog.push(`${playedCard.name}'s battlecry triggers`);
      }
    } else {
      currentLog.push("Enemy has no playable cards this turn");
      set({ ...newState, combatLog: currentLog });
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Process AI end of turn effects
    newState = processEndOfTurnEffects(newState.ai.board, newState, false);

    // AI Attacks
    const attackResult = executeAIAttacks(newState);
    newState = attackResult.newState;
    currentLog.push(...attackResult.logMessages);

    if (attackResult.totalDamage > 0) {
      set({ ...newState, combatLog: currentLog, aiAction: 'Attacking...' });
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // End turn: draw cards, increment turn, reset mana
    const turnResult = incrementTurn(newState.turnNumber, newState.player.maxMana);
    const playerDraw = drawCards(newState.player.deck, 1);
    const aiDraw = drawCards(newState.ai.deck, 1);

    if (playerDraw.drawn.length > 0) {
      currentLog.push(`You draw: ${playerDraw.drawn[0].name}`);
    }
    currentLog.push(`Your turn begins. (${turnResult.newMaxMana} mana available)`);

    // Check game over conditions
    const gameResult = checkGameOver(newState.player.health, newState.ai.health);

    // Final state update
    set({
      ...newState,
      currentTurn: 'player',
      turnNumber: turnResult.turnNumber,
      combatLog: currentLog,
      aiAction: undefined,
      player: {
        ...newState.player,
        maxMana: turnResult.newMaxMana,
        mana: turnResult.newMaxMana,
        hand: addCardsToHand(newState.player.hand, playerDraw.drawn),
        deck: playerDraw.remaining,
        board: enableMinionAttacks(newState.player.board),
      },
      ai: {
        ...newState.ai,
        maxMana: turnResult.newMaxMana,
        mana: turnResult.newMaxMana,
        hand: addCardsToHand(newState.ai.hand, aiDraw.drawn),
        deck: aiDraw.remaining,
        board: enableMinionAttacks(newState.ai.board),
      },
      ...gameResult,
    });
  },

  resetBattle: () => set(createInitialState()),
}));