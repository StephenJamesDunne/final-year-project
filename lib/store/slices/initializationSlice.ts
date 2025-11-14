import { StateCreator } from 'zustand';
import { Card } from '../../types/game';
import { createArchetypeDeck, drawCards } from '../../game/deckManager';
import { DeckSlice } from './deckSlice';
import { BattleSlice } from './battleSlice';

function initializeClientDeck(deck: Card[]): Card[] {
  return deck.map((card, index) => ({
    ...card,
    instanceId: `${card.id}-deck-${index}-${Date.now()}-${Math.random()}`
  }));
}

export interface InitializationSlice {
  startBattle: () => void;
  resetBattle: () => void;
  resetGame: () => void;
}

export const createInitializationSlice: StateCreator<
  InitializationSlice & DeckSlice & BattleSlice,
  [],
  [],
  InitializationSlice
> = (set, get) => ({
  startBattle: () => {
    const state = get();
    if (!state.playerDeckArchetype || !state.aiDeckArchetype) {
      console.warn('Cannot start battle: Both decks must be selected');
      return;
    }

    const playerDeck = createArchetypeDeck(state.playerDeckArchetype);
    const aiDeck = createArchetypeDeck(state.aiDeckArchetype);

    const clientPlayerDeck = initializeClientDeck(playerDeck);
    const clientAIDeck = initializeClientDeck(aiDeck);

    const playerDraw = drawCards(clientPlayerDeck, 4);
    const aiDraw = drawCards(clientAIDeck, 4);

    set({
      player: {
        health: 30,
        mana: 1,
        maxMana: 1,
        hand: playerDraw.drawn,
        board: [],
        deck: playerDraw.remaining,
      },
      ai: {
        health: 30,
        mana: 1,
        maxMana: 1,
        hand: aiDraw.drawn,
        board: [],
        deck: aiDraw.remaining,
      },
      currentTurn: 'player',
      turnNumber: 1,
      gameOver: false,
      winner: undefined,
      combatLog: [
        "The battle begins!",
        `You chose: ${state.playerDeckArchetype.toUpperCase()}`,
        `Enemy chose: ${state.aiDeckArchetype.toUpperCase()}`,
      ],
      aiAction: undefined,
      selectedMinion: null,
      initialized: true,
    });
  },

  resetBattle: () => {
    const state = get();
    set({ 
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
      playerDeckArchetype: state.playerDeckArchetype,
      aiDeckArchetype: state.aiDeckArchetype,
      initialized: false 
    });
  },

  resetGame: () => {
    set({
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
      playerDeckArchetype: null,
      aiDeckArchetype: null,
      initialized: false,
    });
  },
});