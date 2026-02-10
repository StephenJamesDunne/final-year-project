// Deck Slice

// Purpose: Manages deck archetype selection for both player and AI.
// Also manages AI type selection (rule-based vs DQN) and creates the appropriate AI strategy instance.
// This slice is used during the deck selection phase before the battle starts

import { StateCreator } from "zustand";
import { DeckArchetype } from "../../types/game";
import { AIStrategy, createAI, AIType } from "../../ai/aiStrategy";

export interface DeckSlice {
  playerDeckArchetype: DeckArchetype | null;
  aiDeckArchetype: DeckArchetype | null;
  aiType: AIType;
  aiStrategy: AIStrategy;

  selectPlayerDeck: (archetype: DeckArchetype) => void;
  selectAIDeck: (archetype: DeckArchetype) => void;
  selectAIType: (type: AIType) => void;
}

export const createDeckSlice: StateCreator<DeckSlice> = (set) => ({
  playerDeckArchetype: null,
  aiDeckArchetype: null,
  aiType: "rule-based",
  aiStrategy: createAI("rule-based"),

  selectPlayerDeck: (archetype) => {
    set({ playerDeckArchetype: archetype });
  },

  selectAIDeck: (archetype) => {
    set({ aiDeckArchetype: archetype });
  },

  selectAIType: (type) => {
    set({
      aiType: type,
      aiStrategy: createAI(type),
    });
  },
});
