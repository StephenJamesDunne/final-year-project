import { create } from 'zustand';
import { BattleState, Card } from '../types/game';
import { waitForHydration } from '../utils/clientUtils';

// Import game modules
import { createMinion, checkGameOver, updateBoardAfterCombat, handleMinionCombat, handleHeroAttack, enableMinionAttacks, incrementTurn } from '../game/gameLogic';
import { createStartingDeck, drawCards, removeCardFromHand, addCardsToHand } from '../game/deckManager';
import { processAbilities, processDeathrattles, processEndOfTurnEffects } from '../game/abilitySystem';
import { getAIAction, executeAIPlayCard, executeAIAttacks, getAIDecisionDelay } from '../game/aiPlayer';


interface BattleStore extends BattleState {
  playCard: (cardIndex: number, targetId?: string) => void;
  attack: (attackerId: string, targetId: string) => void;
  attackHero: (attackerId: string) => void;
  selectMinion: (minionId: string | null) => void;
  endTurn: () => void;
  resetBattle: () => void;
  resetGame: () => void;
  initialized: boolean;
  selectedMinion: string | null;
  initializeClientState: () => void;
}

// Add instanceId to cards for client-side tracking
function initializeClientDeck(deck: Card[]): Card[] {
  return deck.map((card, index) => ({
    ...card,
    instanceId: `${card.id}-deck-${index}-${Date.now()}-${Math.random()}`
  }));
}

function createInitialState(): BattleState & { selectedMinion: string | null } {
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
    winner: undefined,
    combatLog: ["The sound of battle roars across the Five Realms!"],
    aiAction: undefined,
    selectedMinion: null,
  };
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  ...createInitialState(),
  initialized: false,

  initializeClientState: async () => {
    await waitForHydration();

    const state = get();
    if (state.initialized) return;

    set({
      player: { ...state.player, deck: initializeClientDeck(state.player.deck) },
      ai: { ...state.ai, deck: initializeClientDeck(state.ai.deck) },
      currentTurn: state.currentTurn,
      turnNumber: state.turnNumber,
      gameOver: state.gameOver,
      winner: state.winner,
      combatLog: state.combatLog,
      aiAction: state.aiAction,
      selectedMinion: state.selectedMinion,
      initialized: true
    });
  },

  selectMinion: (minionId: string | null) => {
    set({ selectedMinion: minionId });
  },

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
      newState.player.board = [...newState.player.board, createMinion(card)];
      newState.combatLog.push(`You play ${card.name}`);
    }

    // Process abilities
    newState = processAbilities(card, 'battlecry', newState, true);
    set({ ...newState, selectedMinion: null });
  },

  attack: (attackerId: string, targetId: string) => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    const attacker = state.player.board.find(m => m.instanceId === attackerId);
    if (!attacker || !attacker.canAttack) return;

    let newState: BattleState = {
      ...state,
      combatLog: [...state.combatLog]
    };

    // Attack enemy minion
    const target = newState.ai.board.find(m => m.instanceId === targetId);
    if (!target) return;

    const combatResult = handleMinionCombat(attacker, target);

    // Update both boards
    newState.player.board = updateBoardAfterCombat(
      newState.player.board,
      attackerId,
      combatResult.updatedAttacker
    );

    newState.ai.board = updateBoardAfterCombat(
      newState.ai.board,
      targetId,
      combatResult.updatedTarget
    );

    // Combat log
    newState.combatLog.push(`${attacker.name} attacks ${target.name}`);
    if (combatResult.attackerDied) {
      newState.combatLog.push(`${attacker.name} dies!`);
    }
    if (combatResult.targetDied) {
      newState.combatLog.push(`${target.name} dies!`);
    }

    // Process deathrattles
    if (combatResult.targetDied && target.abilities) {
      newState = processAbilities(target, 'deathrattle', newState, false);
    }
    if (combatResult.attackerDied && attacker.abilities) {
      newState = processAbilities(attacker, 'deathrattle', newState, true);
    }

    set({ ...newState, selectedMinion: null });
  },

  attackHero: (attackerId: string) => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    const attacker = state.player.board.find(m => m.instanceId === attackerId);
    if (!attacker || !attacker.canAttack) return;

    let newState: BattleState = {
      ...state,
      combatLog: [...state.combatLog]
    };

    // Attack enemy hero
    const heroAttack = handleHeroAttack(attacker, newState.ai.health);
    newState.ai.health -= heroAttack.damage;
    newState.player.board = updateBoardAfterCombat(
      newState.player.board,
      attackerId,
      heroAttack.updatedAttacker
    );

    newState.combatLog.push(`${attacker.name} attacks the enemy hero for ${heroAttack.damage} damage!`);

    const gameResult = checkGameOver(newState.player.health, newState.ai.health);
    Object.assign(newState, gameResult);

    set({ ...newState, selectedMinion: null });
  },

  endTurn: async () => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    // Clear selection
    set({ selectedMinion: null });

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

      // Log battlecry effects, if any 
      if (result.playedCard?.abilities?.some(a => a.trigger === 'battlecry')) {
        currentLog.push(`${result.playedCard.name}'s battlecry triggers`);
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
      selectedMinion: null,
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

  resetBattle: () => set({ ...createInitialState(), initialized: false }),

  resetGame: () => {
    set({ ...createInitialState(), initialized: false });
  },
}));