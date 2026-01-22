/**
 * Deck Slice
 * 
 * Purpose:
 * Manages deck archetype selection before a battle begins.
 * Handles both player and AI deck choices from the deck selection screen.
 * 
 * Usage Example:
 * const playerDeck = useBattleStore(state => state.playerDeckArchetype);
 * const selectPlayerDeck = useBattleStore(state => state.selectPlayerDeck);
 * 
 * selectPlayerDeck('fire'); // Choose fire deck for player
 * 
 */

import { StateCreator } from 'zustand';
import { DeckArchetype } from '../../types/game';

export interface DeckSlice {
  playerDeckArchetype: DeckArchetype | null;
  aiDeckArchetype: DeckArchetype | null;
  selectPlayerDeck: (archetype: DeckArchetype) => void;
  selectAIDeck: (archetype: DeckArchetype) => void;
}

export const createDeckSlice: StateCreator<DeckSlice> = (set) => ({
  playerDeckArchetype: null,
  aiDeckArchetype: null,

  selectPlayerDeck: (archetype) => {
    set({ playerDeckArchetype: archetype });
  },

  selectAIDeck: (archetype) => {
    set({ aiDeckArchetype: archetype });
  },
});