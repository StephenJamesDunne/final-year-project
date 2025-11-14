'use client';

import { useBattleStore } from '@/lib/store/battleStore';
import { PixiGameBoard } from '@/components/game/PixiGameBoard';
import { DeckSelector } from '@/components/DeckSelector';

export default function BattlePage() {
  const {
    // Nested state (using player.* and ai.*)
    player,
    ai,
    selectedMinion,

    // Game state
    currentTurn,
    gameOver,
    winner,
    combatLog,
    turnNumber,
    aiAction,
    playerDeckArchetype,
    aiDeckArchetype,
    initialized,
    selectPlayerDeck,
    selectAIDeck,
    startBattle,

    // Actions
    playCard,
    selectMinion,
    attack,
    attackHero,
    endTurn,
  } = useBattleStore();

  // Show deck selection screen if battle not started
  if (!initialized) {
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

  const handleCardPlay = (cardIndex: number) => {
    playCard(cardIndex);
  };

  const handleMinionClick = (minionId: string, isPlayer: boolean) => {
    console.log('handleMinionClick:', { minionId, isPlayer, currentTurn, selectedMinion });

    const currentState = useBattleStore.getState();

    console.log('handleMinionClick:', {
      minionId,
      isPlayer,
      currentTurn: currentState.currentTurn,
      selectedMinion: currentState.selectedMinion
    });

    if (isPlayer && currentState.currentTurn === 'player') {
      if (currentState.selectedMinion === minionId) {
        console.log('Deselecting minion');
        selectMinion(null);
      } else {
        console.log('Selecting minion:', minionId);
        selectMinion(minionId);
      }
    }
  };

  const handleTargetClick = (targetId: string) => {
    const currentState = useBattleStore.getState();

    console.log('handleTargetClick:', {
      targetId,
      selectedMinion: currentState.selectedMinion,
      currentTurn: currentState.currentTurn
    });

    if (currentState.selectedMinion && currentState.currentTurn === 'player') {
      console.log('Attacking with:', currentState.selectedMinion, 'targeting:', targetId);
      attack(currentState.selectedMinion, targetId);
    }
  };

  const handleAIFaceClick = () => {
    const currentState = useBattleStore.getState();

    console.log('handleAIFaceClick:', {
      selectedMinion: currentState.selectedMinion,
      currentTurn: currentState.currentTurn
    });

    if (currentState.selectedMinion && currentState.currentTurn === 'player') {
      console.log('Attacking AI hero with:', currentState.selectedMinion);
      attackHero(currentState.selectedMinion);
    }
  };

  return (
    <PixiGameBoard
      // Board (from player.* and ai.*)
      playerBoard={player.board}
      aiBoard={ai.board}
      playerHand={player.hand}
      aiHandCount={ai.hand.length}

      // Callbacks
      onCardPlay={handleCardPlay}
      onMinionClick={handleMinionClick}
      onTargetClick={handleTargetClick}
      onAIFaceClick={handleAIFaceClick}
      onEndTurn={endTurn}

      // State
      selectedMinion={selectedMinion}
      currentTurn={currentTurn}

      // Resources (from player.* and ai.*)
      playerMana={player.mana}
      playerMaxMana={player.maxMana}
      playerHealth={player.health}
      aiMana={ai.mana}
      aiMaxMana={ai.maxMana}
      aiHealth={ai.health}

      // Game state
      gameOver={gameOver}
      winner={winner}
      combatLog={combatLog}
      turnNumber={turnNumber}
      aiAction={aiAction}
    />
  );
}