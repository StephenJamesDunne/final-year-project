/**
 * Deck Slice
 * 
 * Purpose:
 * Manages deck archetype selection before a battle begins.
 * Handles both player and AI deck choices from the deck selection screen.
 * 
 * Deck Archetypes:
 * - fire: Aggressive (Connacht Warriors) - Fast damage and burn spells
 * - water: Tempo (Leinster Wisdom) - Card draw and efficient minions
 * - earth: Defensive (Munster Endurance) - Healing and high-health minions
 * - air: Balanced (Ulster Cunning) - Flexible answers and disruption
 * 
 * Usage Example:
 * const playerDeck = useBattleStore(state => state.playerDeckArchetype);
 * const selectPlayerDeck = useBattleStore(state => state.selectPlayerDeck);
 * 
 * selectPlayerDeck('fire'); // Choose fire deck for player
 * 
 * @see initializationSlice.ts - Uses these selections to create decks
 * @see components/DeckSelector.tsx - UI for deck selection
 * @see lib/game/deckManager.ts - createArchetypeDeck() function
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