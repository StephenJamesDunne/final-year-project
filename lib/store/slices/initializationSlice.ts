/**
 * Initialization Slice
 * 
 * Purpose:
 * Handles battle initialization when the user clicks "Start Battle" after
 * selecting deck archetypes. Creates decks, deals initial hands, and sets
 * up the initial game state.
 * 
 * State Dependencies:
 * Requires access to:
 * - deckSlice: playerDeckArchetype and aiDeckArchetype
 * - battleSlice: Sets all initial battle state parameters
 * 
 * <button onClick={startBattle} disabled={!canStart}>
 *   Start Battle
 * </button>
 * 
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