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
  initialized: false,

  selectMinion: (minionId) => {
    set({ selectedMinion: minionId });
  },
});