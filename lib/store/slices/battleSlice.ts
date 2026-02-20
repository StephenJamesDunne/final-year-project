/**
 * Battle Slice
 * 
 * Purpose:
 * Manages core game state for an active battle including player stats,
 * AI stats, turn information, game status, and UI state.
 * 
 * State Structure:
 * - player: Player state (health, mana, hand, board, deck)
 * - ai: AI state (same structure as player)
 * - currentTurn: Whose turn it is ('player' | 'ai')
 * - turnNumber: Current turn count (starts at 1)
 * - gameOver: Whether the game has ended
 * - winner: Winner if game is over ('player' | 'ai')
 * - combatLog: Array of game event messages
 * - aiAction: Current AI action being displayed
 * - selectedMinion: Currently selected minion instanceId
 * - initialized: Whether battle has started
 * 
 * Actions:
 * - selectMinion(minionId): Select/deselect a minion for attacking
 * 
 * State Updates:
 * This slice primarily holds state that is updated by other slices:
 * - gameActionsSlice: Updates player/ai state during combat
 * - turnSlice: Updates turn-related state and manages turn flow
 * - initializationSlice: Sets initial state when battle starts 
 * 
 */

import { StateCreator } from 'zustand';
import { BattleState } from '../../types/game';

export interface BattleSlice extends BattleState {
  initialized: boolean;
  selectedMinion: string | null;
  selectMinion: (minionId: string | null) => void;
}

export const createBattleSlice: StateCreator<BattleSlice> = (set) => ({
  player: {
    health: 30,
    mana: 1,
    maxMana: 1,
    hand: [],
    board: [],
    deck: [],
    fatigueCounter: 0,
  },
  ai: {
    health: 30,
    mana: 1,
    maxMana: 1,
    hand: [],
    board: [],
    deck: [],
    fatigueCounter: 0,
  },
  currentTurn: 'player',
  turnNumber: 1,
  gameOver: false,
  winner: undefined,
  combatLog: [],
  aiAction: undefined,
  selectedMinion: null,
  initialized: false,

  selectMinion: (minionId) => {
    set({ selectedMinion: minionId });
  },
});