// Main page after landing into battle mode (entry point for /battle URL).
// Renders either deck selector or game board based on state

'use client';

import { useMemo } from 'react';
import { useBattleStore } from '@/lib/store/battleStore';
import { PixiGameBoard } from '@/components/game/PixiGameBoard';
import { DeckSelector } from '@/components/DeckSelector';
import { BoardState, BoardCallbacks } from '@/lib/pixi';

export default function BattlePage() {
  const initialized = useBattleStore((state) => state.initialized);

  // Battle hasn't started, show deck selection component
  if (!initialized) {
    return <DeckSelectionScreen />;
  }

  // Once game is initialized, render the Pixi game board
  return <BattleScreen />;
}

// Deck Selection Screen
function DeckSelectionScreen() {
  const playerDeckArchetype = useBattleStore((state) => state.playerDeckArchetype);
  const aiDeckArchetype = useBattleStore((state) => state.aiDeckArchetype);
  const selectPlayerDeck = useBattleStore((state) => state.selectPlayerDeck);
  const selectAIDeck = useBattleStore((state) => state.selectAIDeck);
  const startBattle = useBattleStore((state) => state.startBattle);

  const canStartBattle = playerDeckArchetype !== null && aiDeckArchetype !== null;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8 space-y-8">
      <h1 className="text-4xl font-bold text-white mb-8">Choose Your Decks</h1>

      <DeckSelector
        selectedDeck={playerDeckArchetype}
        onSelectDeck={selectPlayerDeck}
        label="Your Deck"
      />

      <DeckSelector
        selectedDeck={aiDeckArchetype}
        onSelectDeck={selectAIDeck}
        label="Opponent's Deck"
      />

      <button
        onClick={startBattle}
        disabled={!canStartBattle}
        className={`
          px-8 py-4 rounded-lg text-2xl font-bold transition-all
          ${canStartBattle
            ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {canStartBattle ? 'Start Battle!' : 'Select Both Decks'}
      </button>
    </div>
  );
}

  // Battle Screen with Pixi Game Board
  // Only subscribes to necessary state slices and memoizes callbacks

  function BattleScreen() {
    const player = useBattleStore((state) => state.player);
    const ai = useBattleStore((state) => state.ai);
    const currentTurn = useBattleStore((state) => state.currentTurn);
    const turnNumber = useBattleStore((state) => state.turnNumber);
    const gameOver = useBattleStore((state) => state.gameOver);
    const winner = useBattleStore((state) => state.winner);
    const combatLog = useBattleStore((state) => state.combatLog);
    const aiAction = useBattleStore((state) => state.aiAction);
    const selectedMinion = useBattleStore((state) => state.selectedMinion);

    // Build state object for PixiBoard
    const boardState: BoardState = useMemo(() => ({
      playerBoard: player.board,
      aiBoard: ai.board,
      playerHand: player.hand,
      aiHandCount: ai.hand.length,
      selectedMinion,
      currentTurn,
      playerMana: player.mana,
      playerMaxMana: player.maxMana,
      playerHealth: player.health,
      aiMana: ai.mana,
      aiMaxMana: ai.maxMana,
      aiHealth: ai.health,
      gameOver,
      winner,
      combatLog,
      turnNumber,
      aiAction,
    }), [
      player.board,
      player.hand,
      player.mana,
      player.maxMana,
      player.health,
      ai.board,
      ai.hand.length,
      ai.mana,
      ai.maxMana,
      ai.health,
      selectedMinion,
      currentTurn,
      gameOver,
      winner,
      combatLog,
      turnNumber,
      aiAction,
    ]);

    // Callbacks object for PixiBoard
    // Uses getState() to avoid stale closures
    const boardCallbacks: BoardCallbacks = useMemo(() => ({
      onCardPlay: (cardIndex: number) => {
        useBattleStore.getState().playCard(cardIndex);
      },

      onMinionClick: (minionId: string, isPlayer: boolean) => {
        const { currentTurn, selectedMinion, selectMinion } = useBattleStore.getState();

        if (isPlayer && currentTurn === 'player') {
          selectMinion(selectedMinion === minionId ? null : minionId);
        }
      },

      onTargetClick: (targetId: string) => {
        const { selectedMinion, currentTurn, attack } = useBattleStore.getState();

        if (selectedMinion && currentTurn === 'player') {
          attack(selectedMinion, targetId);
        }
      },

      onAIFaceClick: () => {
        const { selectedMinion, currentTurn, attackHero } = useBattleStore.getState();

        if (selectedMinion && currentTurn === 'player') {
          attackHero(selectedMinion);
        }
      },

      onEndTurn: () => {
        useBattleStore.getState().endTurn();
      },
    }), []);

    return (
      <PixiGameBoard
        state={boardState}
        callbacks={boardCallbacks}
      />
    );
  }