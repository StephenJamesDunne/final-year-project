import { create } from 'zustand';
import { BattleState, Player, Card, DeckArchetype } from '../types/game';
import { waitForHydration } from '../utils/clientUtils';

// Import game modules
import { 
  createMinion, 
  checkGameOver, 
  updateBoardAfterCombat, 
  handleMinionCombat, 
  handleHeroAttack, 
  enableMinionAttacks, 
  incrementTurn 
} from '../game/gameLogic';
import { 
  createArchetypeDeck, 
  drawCards, 
  removeCardFromHand, 
  addCardsToHand 
} from '../game/deckManager';
import { 
  processAbilities, 
  processDeathrattles, 
  processEndOfTurnEffects 
} from '../game/abilitySystem';
import { 
  getAIAction, 
  executeAIPlayCard, 
  executeAIAttacks, 
  getAIDecisionDelay 
} from '../game/aiPlayer';

// ═══════════════════════════════════════════════════════════════
// STORE INTERFACE
// ═══════════════════════════════════════════════════════════════

interface BattleStore extends BattleState {
  // State properties
  initialized: boolean;
  selectedMinion: string | null;
  playerDeckArchetype: DeckArchetype | null;
  aiDeckArchetype: DeckArchetype | null;

  // Deck selection actions
  selectPlayerDeck: (archetype: DeckArchetype) => void;
  selectAIDeck: (archetype: DeckArchetype) => void;
  startBattle: () => void;

  // Battle actions
  playCard: (cardIndex: number, targetId?: string) => void;
  attack: (attackerId: string, targetId: string) => void;
  attackHero: (attackerId: string) => void;
  selectMinion: (minionId: string | null) => void;
  endTurn: () => void;

  // Game management actions
  resetBattle: () => void;
  resetGame: () => void;
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Add instanceId to cards for client-side tracking
function initializeClientDeck(deck: Card[]): Card[] {
  return deck.map((card, index) => ({
    ...card,
    instanceId: `${card.id}-deck-${index}-${Date.now()}-${Math.random()}`
  }));
}

// Create initial empty state (before deck selection)
function createInitialState(): BattleState & {
  selectedMinion: string | null;
  playerDeckArchetype: DeckArchetype | null;
  aiDeckArchetype: DeckArchetype | null;
  initialized: boolean;
} {
  return {
    player: {
      health: 30,
      mana: 1,
      maxMana: 1,
      hand: [],
      board: [],
      deck: [],
    },
    ai: {
      health: 30,
      mana: 1,
      maxMana: 1,
      hand: [],
      board: [],
      deck: [],
    },
    currentTurn: 'player',
    turnNumber: 1,
    gameOver: false,
    winner: undefined,
    combatLog: [],
    aiAction: undefined,
    selectedMinion: null,
    playerDeckArchetype: null,
    aiDeckArchetype: null,
    initialized: false,
  };
}

// ═══════════════════════════════════════════════════════════════
// STORE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

export const useBattleStore = create<BattleStore>((set, get) => ({
  ...createInitialState(),

  // ─────────────────────────────────────────────────────────────
  // DECK SELECTION ACTIONS
  // ─────────────────────────────────────────────────────────────

  selectPlayerDeck: (archetype: DeckArchetype) => {
    set({ playerDeckArchetype: archetype });
  },

  selectAIDeck: (archetype: DeckArchetype) => {
    set({ aiDeckArchetype: archetype });
  },

  startBattle: () => {
    const state = get();
    if (!state.playerDeckArchetype || !state.aiDeckArchetype) {
      console.warn('Cannot start battle: Both decks must be selected');
      return;
    }

    // Create decks based on selected archetypes
    const playerDeck = createArchetypeDeck(state.playerDeckArchetype);
    const aiDeck = createArchetypeDeck(state.aiDeckArchetype);

    // Initialize client-side card tracking
    const clientPlayerDeck = initializeClientDeck(playerDeck);
    const clientAIDeck = initializeClientDeck(aiDeck);

    // Draw starting hands (4 cards each)
    const playerDraw = drawCards(clientPlayerDeck, 4);
    const aiDraw = drawCards(clientAIDeck, 4);

    // Set up battle state
    set({
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
      combatLog: [
        "The battle begins!",
        `You chose: ${state.playerDeckArchetype.toUpperCase()}`,
        `Enemy chose: ${state.aiDeckArchetype.toUpperCase()}`,
      ],
      aiAction: undefined,
      selectedMinion: null,
      initialized: true,
    });
  },

  // ─────────────────────────────────────────────────────────────
  // SELECTION ACTIONS
  // ─────────────────────────────────────────────────────────────

  selectMinion: (minionId: string | null) => {
    set({ selectedMinion: minionId });
  },

  // ─────────────────────────────────────────────────────────────
  // CARD PLAY ACTION
  // ─────────────────────────────────────────────────────────────

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
    } else if (card.type === 'spell') {
      newState.combatLog.push(`You cast ${card.name}`);
    }

    // Process abilities (battlecry for minions, immediate effects for spells)
    newState = processAbilities(card, 'battlecry', newState, true);
    
    set({ ...newState, selectedMinion: null });
  },

  // ─────────────────────────────────────────────────────────────
  // ATTACK ACTIONS
  // ─────────────────────────────────────────────────────────────

  attack: (attackerId: string, targetId: string) => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    const attacker = state.player.board.find(m => m.instanceId === attackerId);
    if (!attacker || !attacker.canAttack) return;

    const target = state.ai.board.find(m => m.instanceId === targetId);
    if (!target) return;

    let newState: BattleState = {
      ...state,
      combatLog: [...state.combatLog]
    };

    // Execute minion combat
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
    newState.combatLog.push(
      `${attacker.name} (${attacker.attack}/${attacker.health}) attacks ${target.name} (${target.attack}/${target.health})`
    );
    
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

    newState.combatLog.push(
      `${attacker.name} attacks the enemy hero for ${heroAttack.damage} damage!`
    );

    // Check for game over
    const gameResult = checkGameOver(newState.player.health, newState.ai.health);
    Object.assign(newState, gameResult);

    set({ ...newState, selectedMinion: null });
  },

  // ─────────────────────────────────────────────────────────────
  // END TURN ACTION (Player → AI → Player)
  // ─────────────────────────────────────────────────────────────

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
    currentLog.push("Enemy Turn");

    // Process end of turn effects for player minions
    newState = processEndOfTurnEffects(newState.player.board, newState, true);

    // ═══ AI DECISION MAKING ═══

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

    // ═══ AI ATTACKS ═══

    const attackResult = executeAIAttacks(newState);
    newState = attackResult.newState;
    currentLog.push(...attackResult.logMessages);

    if (attackResult.totalDamage > 0) {
      set({ 
        ...newState, 
        combatLog: currentLog, 
        aiAction: 'Attacking...' 
      });
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // ═══ END TURN CLEANUP ═══

    // Increment turn counter
    const turnResult = incrementTurn(newState.turnNumber, newState.player.maxMana);
    
    // Draw cards for both players
    const playerDraw = drawCards(newState.player.deck, 1);
    const aiDraw = drawCards(newState.ai.deck, 1);

    if (playerDraw.drawn.length > 0) {
      currentLog.push(`You draw: ${playerDraw.drawn[0].name}`);
    } else {
      currentLog.push(`You draw nothing (deck empty)`);
    }
    currentLog.push(`Turn ${turnResult.turnNumber} begins (${turnResult.newMaxMana} mana)`);
    // Check game over conditions
    const gameResult = checkGameOver(newState.player.health, newState.ai.health);

    if (gameResult.gameOver) {
      currentLog.push(gameResult.winner === 'player' ? 'VICTORY!' : 'DEFEAT!');
    }

    // Final state update - back to player's turn
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

  // ─────────────────────────────────────────────────────────────
  // GAME RESET ACTIONS
  // ─────────────────────────────────────────────────────────────

  resetBattle: () => {
    const state = get();
    const playerDeck = state.playerDeckArchetype;
    const aiDeck = state.aiDeckArchetype;

    // Reset to initial state but keep deck selections
    set({ 
      ...createInitialState(), 
      playerDeckArchetype: playerDeck,
      aiDeckArchetype: aiDeck,
      initialized: false 
    });
  },

  resetGame: () => {
    // Complete reset - back to deck selection
    set({ ...createInitialState(), initialized: false });
  },
}));