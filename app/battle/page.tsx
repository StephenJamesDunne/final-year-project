'use client';

import { useBattleStore } from '@/lib/store/battleStore';
import { Card } from '@/components/game/Card';
import { useState } from 'react';

export default function BattlePage() {
  const { player, ai, currentTurn, gameOver, winner, playCard, attack, endTurn, resetBattle } = useBattleStore();
  const [selectedMinion, setSelectedMinion] = useState<string | null>(null);
  
  const handleMinionClick = (minionId: string) => {
    if (currentTurn !== 'player' || gameOver) return;
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
  
  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Game Over Overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-12 rounded-xl border-4 border-yellow-500 text-center">
            <h2 className="text-5xl font-bold mb-6">
              {winner === 'player' ? '🎉 Victory!' : '💀 Defeat'}
            </h2>
            <button
              onClick={resetBattle}
              className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-lg text-2xl font-bold"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      {/* AI Health/Mana - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <div 
          className={`bg-red-900/80 border-2 border-red-600 rounded-lg p-4 backdrop-blur-sm transition-all ${
            selectedMinion ? 'cursor-crosshair ring-4 ring-yellow-400 hover:bg-red-800/90' : ''
          }`}
          onClick={selectedMinion ? handleAIFaceClick : undefined}
        >
          <div className="text-center">
            <div className="text-lg font-bold mb-2">AI Opponent</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">❤️</span>
              <span className="text-2xl font-bold">{ai.health}</span>
            </div>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="text-lg font-bold text-blue-300">{ai.mana}/{ai.maxMana}</span>
              <div className="flex gap-1">
              {Array.from({ length: ai.maxMana }).map((_, i) => (
                <div
                  key={`ai-mana-${i}`}
                  className={`w-3 h-3 rounded-full ${
                    i < ai.mana ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                />
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Health/Mana - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-blue-900/80 border-2 border-blue-600 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-lg font-bold mb-2">You</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">❤️</span>
              <span className="text-2xl font-bold">{player.health}</span>
            </div>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="text-lg font-bold text-blue-300">{player.mana}/{player.maxMana}</span>
              <div className="flex gap-1">
              {Array.from({ length: player.maxMana }).map((_, i) => (
                <div
                  key={`player-mana-${i}`}
                  className={`w-3 h-3 rounded-full ${
                    i < player.mana ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                />
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Five Realms
        </h1>
        <p className="text-gray-400 text-sm">Turn {Math.ceil(useBattleStore.getState().turnNumber / 2)}</p>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-6xl mx-auto px-4">
        
        {/* AI Hand (hidden cards) */}
        <div className="flex justify-center gap-1 mb-2">
          {ai.hand.map((_, i) => (
            <div
              key={`ai-hand-${i}`}
              className="w-8 h-12 bg-red-600 rounded border border-red-400"
            />
          ))}
        </div>

        {/* AI Board */}
        <div className="bg-red-900/20 border-2 border-red-800 rounded-lg p-3 flex-1 min-h-0">
          <div className="flex gap-2 justify-center flex-wrap h-full items-center">
            {ai.board.length === 0 && (
              <div className="text-gray-500 text-center">
                Enemy board is empty
                {selectedMinion && (
                  <div className="text-yellow-400 text-sm mt-2 animate-bounce">
                    Click on AI portrait to attack directly!
                  </div>
                )}
              </div>
            )}
            {ai.board.map(minion => (
              <div
                key={`ai-board-${minion.instanceId}`}
                onClick={() => handleTargetClick(minion.instanceId)}
                className={selectedMinion ? 'cursor-crosshair' : ''}
              >
                <Card 
                  card={minion} 
                  isMinion 
                  showHealth
                  onClick={() => handleTargetClick(minion.instanceId)}
                  disabled={!selectedMinion}
                  compact
                  location='board'
                />
              </div>
            ))}
          </div>
        </div>

        {/* Middle Divider with Controls */}
        <div className="flex justify-center items-center py-3">
          <button
            onClick={endTurn}
            disabled={currentTurn !== 'player' || gameOver}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 px-8 py-2 rounded-lg text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            End Turn
          </button>
          {selectedMinion && (
            <div className="ml-4 text-yellow-400 text-sm animate-bounce">
              Select target!
            </div>
          )}
        </div>

        {/* Player Board */}
        <div className="bg-blue-900/20 border-2 border-blue-800 rounded-lg p-3 flex-1 min-h-0">
          <div className="flex gap-2 justify-center flex-wrap h-full items-center">
            {player.board.length === 0 && (
              <div className="text-gray-500 text-center">
                Your board is empty
              </div>
            )}
            {player.board.map(minion => (
              <div
                key={`player-board-${minion.instanceId}`}
                onClick={() => handleMinionClick(minion.instanceId)}
                className={minion.canAttack && currentTurn === 'player' ? 'cursor-pointer' : ''}
              >
                <Card 
                  card={minion} 
                  isMinion 
                  showHealth
                  disabled={!minion.canAttack || currentTurn !== 'player'}
                  compact
                  location='board'
                />
              </div>
            ))}
          </div>
        </div>

        {/* Player Hand */}
        <div className="bg-gray-800/50 border-2 border-gray-700 rounded-lg p-3 mt-2">
          <div className="flex gap-2 justify-center flex-wrap">
            {player.hand.map((card, index) => (
              <Card
                key={`player-hand-${card.id}-${index}`}
                card={card}
                onClick={() => playCard(index)}
                disabled={card.manaCost > player.mana || currentTurn !== 'player'}
                compact
                cardIndex={index}
                location='hand'
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}