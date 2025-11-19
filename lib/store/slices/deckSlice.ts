/**
 * Deck Slice
 * 
 * Purpose:
 * Manages deck archetype selection before a battle begins.
 * Handles both player and AI deck choices from the deck selection screen.
 * 
 * State:
 * - playerDeckArchetype: Player's chosen deck ('fire' | 'water' | 'earth' | 'air' | null)
 * - aiDeckArchetype: AI's chosen deck (same options)
 * 
 * Actions:
 * - selectPlayerDeck(archetype): Set player's deck choice
 * - selectAIDeck(archetype): Set AI's deck choice
 * 
 * Lifecycle:
 * 1. Both archetypes start as null
 * 2. User selects both decks via DeckSelector component
 * 3. When both are selected, "Start Battle" button becomes active
 * 4. initializationSlice.startBattle() reads these values to create decks
 * 5. Archetypes are reset when starting a new battle
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