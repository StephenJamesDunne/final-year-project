/**
 * Battle Store (Main Zustand Store)
 * 
 * Purpose:
 * Composes all game state slices into a single Zustand store.
 * This is the root store that React components import and subscribe to.
 * 
 * Architecture:
 * Uses Zustand's slice pattern to organize all the states:
 * - deckSlice: Deck selection before battle
 * - battleSlice: Core game state (players, turn, game status)
 * - gameActionsSlice: Player action handlers (play card, attack)
 * - turnSlice: Turn management and AI execution
 * - initializationSlice: Battle setup and initialization
 * 
 * Key Features:
 * - Each slice can access full store state via get()
 * - Each slice manages its own functionality independently
 * - Type-safe composition ensures all slices work together
 * 
 * Usage:
 * import { useBattleStore } from '@/lib/store/battleStore';
 * 
 * // Subscribe to specific state
 * const playerHealth = useBattleStore(state => state.player.health);
 * 
 * // Extract actions
 * const playCard = useBattleStore(state => state.playCard);
 * 
 * @see lib/store/slices/ - Individual slice implementations
 */

import { create } from 'zustand';
import { DeckSlice, createDeckSlice } from './slices/deckSlice';
import { BattleSlice, createBattleSlice } from './slices/battleSlice';
import { GameActionsSlice, createGameActionsSlice } from './slices/gameActionsSlice';
import { TurnSlice, createTurnSlice } from './slices/turnSlice';
import { InitializationSlice, createInitializationSlice } from './slices/initializationSlice';

type BattleStore = DeckSlice & 
  BattleSlice & 
  GameActionsSlice & 
  TurnSlice & 
  InitializationSlice;

export const useBattleStore = create<BattleStore>()((...args) => ({
  ...createDeckSlice(...args),
  ...createBattleSlice(...args),
  ...createGameActionsSlice(...args),
  ...createTurnSlice(...args),
  ...createInitializationSlice(...args),
}));