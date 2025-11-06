'use client';

import { useEffect, useState } from 'react';
import { useBattleStore } from '@/lib/store/battleStore';
import { PixiGameBoard } from '@/components/game/PixiGameBoard';

export default function BattlePage() {
  const { 
    player, 
    ai, 
    currentTurn, 
    gameOver, 
    winner, 
    combatLog, 
    turnNumber, 
    aiAction, 
    playCard, 
    attack, 
    endTurn, 
    resetBattle,
    initializeClientState,
    initialized
  } = useBattleStore();
  
  const [selectedMinion, setSelectedMinion] = useState<string | null>(null);

  useEffect(() => {
    initializeClientState();
  }, [initializeClientState]);

  if (!initialized) {
    return (
      <div className="h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          Loading Five Realms...
        </div>
      </div>
    );
  }

  const handleMinionClick = (minionId: string, isPlayer: boolean) => {
    if (currentTurn !== 'player' || gameOver || !isPlayer) return;
    setSelectedMinion(minionId);
  };

  const handleTargetClick = (targetId: string) => {
    if (!selectedMinion) return;
    attack(selectedMinion, targetId);
    setSelectedMinion(null);
  };

  const handleAIFaceClick = () => {
    if (!selectedMinion) return;
    attack(selectedMinion, 'face');
    setSelectedMinion(null);
  };

  const handleCardPlay = (cardIndex: number) => {
    playCard(cardIndex);
  };

  const handleEndTurn = () => {
    setSelectedMinion(null);
    endTurn();
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-900">
      {/* Game Over Overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-16 rounded-2xl border-4 border-yellow-500 text-center shadow-2xl">
            <h2 className="text-6xl font-bold mb-8 text-white">
              {winner === 'player' ? '🎉 Victory!' : '💀 Defeat'}
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              {winner === 'player' 
                ? 'You have conquered the Five Realms!' 
                : 'The AI has proven victorious this time.'}
            </p>
            <button
              onClick={resetBattle}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-12 py-4 rounded-xl text-2xl font-bold text-white shadow-lg transform transition-all hover:scale-105"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* PIXI Game Board - Full Screen */}
      <PixiGameBoard
        playerBoard={player.board}
        aiBoard={ai.board}
        playerHand={player.hand}
        aiHandCount={ai.hand.length}
        onCardPlay={handleCardPlay}
        onMinionClick={handleMinionClick}
        onTargetClick={handleTargetClick}
        onAIFaceClick={handleAIFaceClick}
        onEndTurn={handleEndTurn}
        selectedMinion={selectedMinion}
        currentTurn={currentTurn}
        playerMana={player.mana}
        playerMaxMana={player.maxMana}
        playerHealth={player.health}
        aiMana={ai.mana}
        aiMaxMana={ai.maxMana}
        aiHealth={ai.health}
        gameOver={gameOver}
        winner={winner}
        combatLog={combatLog}
        turnNumber={turnNumber}
        aiAction={aiAction}
      />
    </div>
  );
}