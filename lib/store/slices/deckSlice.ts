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