// Deck Slice

// Purpose: Manages deck archetype selection for both player and AI.
// Also manages AI type selection (rule-based vs DQN) and creates the appropriate AI strategy instance.
// This slice is used during the deck selection phase before the battle starts

import { StateCreator } from "zustand";
import { DeckArchetype } from "../../types/game";
import { AIStrategy, createAI, AIType } from "../../ai/aiStrategy";
import { DeckBuildMode } from "../../game/deckManager";

export interface DeckSlice {
  playerDeckArchetype: DeckArchetype | null;
  aiDeckArchetype: DeckArchetype | null;
  playerDeckMode: DeckBuildMode;
  aiDeckMode: DeckBuildMode;
  aiType: AIType;
  aiStrategy: AIStrategy;

  selectPlayerDeck: (archetype: DeckArchetype) => void;
  selectAIDeck: (archetype: DeckArchetype) => void;
  selectPlayerDeckMode: (mode: DeckBuildMode) => void;
  selectAIDeckMode: (mode: DeckBuildMode) => void;
  selectAIType: (type: AIType) => void;
}

export const createDeckSlice: StateCreator<DeckSlice> = (set) => ({
  playerDeckArchetype: null,
  aiDeckArchetype: null,
  playerDeckMode: "structure",
  aiDeckMode: "structure",
  aiType: "rule-based",
  aiStrategy: createAI("rule-based"),

  selectPlayerDeck: (archetype) => {
    set({ playerDeckArchetype: archetype });
  },

  selectAIDeck: (archetype) => {
    set({ aiDeckArchetype: archetype });
  },

  selectPlayerDeckMode: (mode) => {
    set({ playerDeckMode: mode });
  },

  selectAIDeckMode: (mode) => {
    set({ aiDeckMode: mode });
  },

  selectAIType: (type) => {
    set({
      aiType: type,
      aiStrategy: createAI(type),
    });
  },
});
