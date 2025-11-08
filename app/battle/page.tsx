'use client';

import { useBattleStore } from '@/lib/store/battleStore';
import { PixiGameBoard } from '@/components/game/PixiGameBoard';

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

    // Actions
    playCard,
    selectMinion,
    attack,
    attackHero,
    endTurn,
    resetGame,
  } = useBattleStore();

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