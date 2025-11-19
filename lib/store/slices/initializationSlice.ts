/**
 * Initialization Slice
 * 
 * Purpose:
 * Handles battle initialization when the user clicks "Start Battle" after
 * selecting deck archetypes. Creates decks, deals initial hands, and sets
 * up the initial game state.
 * 
 * Actions:
 * - startBattle(): Initialize battle state and begin the game
 * 
 * Initialization Flow:
 * 1. Validate both player and AI have selected deck archetypes
 * 2. Create decks using createArchetypeDeck() for each archetype
 * 3. Assign unique instanceIds to each card for client-side tracking
 * 4. Shuffle decks (client-side only to avoid SSR hydration issues)
 * 5. Draw initial hands (4 cards each)
 * 6. Set initial game state:
 *    - Both players: 30 health, 1/1 mana
 *    - Turn 1, player goes first
 *    - Empty boards
 *    - Combat log with initial messages
 * 7. Set initialized=true to show game board
 * 
 * Instance ID System:
 * Each card receives a unique instanceId: `${cardId}-deck-${index}-${timestamp}-${random}`
 * This is critical for:
 * - Tracking individual card copies (deck has 2 of each card)
 * - Identifying specific minions on the board for targeting
 * - Future database integration for match history
 * 
 * Client-Side Considerations:
 * Deck shuffling only happens on client (typeof window !== 'undefined')
 * to prevent server/client state mismatch during Next.js SSR.
 * 
 * State Dependencies:
 * Requires access to:
 * - deckSlice: playerDeckArchetype and aiDeckArchetype
 * - battleSlice: Sets all initial battle state
 * 
 * Usage Example:
 * const startBattle = useBattleStore(state => state.startBattle);
 * const canStart = playerDeck !== null && aiDeck !== null;
 * 
 * <button onClick={startBattle} disabled={!canStart}>
 *   Start Battle
 * </button>
 * 
 * @see lib/game/deckManager.ts - createArchetypeDeck() and drawCards()
 * @see deckSlice.ts - Deck archetype selection
 * @see battleSlice.ts - Initial state structure
 */

import { StateCreator } from 'zustand';
import { Card } from '../../types/game';
import { createArchetypeDeck, drawCards } from '../../game/deckManager';
import { DeckSlice } from './deckSlice';
import { BattleSlice } from './battleSlice';

// Assign unique instance IDs to each card in the deck for client-side tracking
// This helps differentiate between multiple copies of the same card in the deck
// Will be even more useful when database integration is added later on
function initializeClientDeck(deck: Card[]): Card[] {
  return deck.map((card, index) => ({
    ...card,
    instanceId: `${card.id}-deck-${index}-${Date.now()}-${Math.random()}`
  }));
}

export interface InitializationSlice {
  startBattle: () => void;
}

// Both deck and battle slices are needed to initialize the battle state
// all deck params and battle params will be set/reset when starting a new battle
type CombinedSlices = InitializationSlice & DeckSlice & BattleSlice;

// Create this function as a Zustand slice
// for initializing the battle state
// the emmpty arrays are for middleware, which I don't plan on using,
// but are required by the StateCreator type when it's called with multiple slices
export const createInitializationSlice: StateCreator<
  CombinedSlices,
  [],
  [],
  InitializationSlice
> = function (set, get) {
  return {
    startBattle: function () {

      // get the current game state to access selected deck archetypes
      const currentState = get();

      if (!currentState.playerDeckArchetype || !currentState.aiDeckArchetype) {
        console.warn('Cannot start battle: Both decks must be selected');
        return;
      }

      const playerDeck = createArchetypeDeck(currentState.playerDeckArchetype);
      const aiDeck = createArchetypeDeck(currentState.aiDeckArchetype);

      const clientPlayerDeck = initializeClientDeck(playerDeck);
      const clientAIDeck = initializeClientDeck(aiDeck);

      const playerDraw = drawCards(clientPlayerDeck, 4);
      const aiDraw = drawCards(clientAIDeck, 4);

      // update the game state to initialize the battle
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
          `You chose: ${currentState.playerDeckArchetype.toUpperCase()}`,
          `Enemy chose: ${currentState.aiDeckArchetype.toUpperCase()}`,
        ],


        aiAction: undefined,
        selectedMinion: null,
        initialized: true,
      });
    },
  };
};