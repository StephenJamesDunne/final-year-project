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