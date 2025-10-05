'use client';

import { useBattleStore } from '@/lib/store/battleStore';

export default function BattlePage() {
  const { player, ai, currentTurn, gameOver, winner, playCard, attack, endTurn, resetBattle } = useBattleStore();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">PackQuest Battle</h1>
        
        {/* AI Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl">AI Health: {ai.health}</span>
            <span className="text-xl">Mana: {ai.mana}/{ai.maxMana}</span>
          </div>
          
          {/* AI Board */}
          <div className="bg-red-900/30 p-4 rounded min-h-[150px] flex gap-2">
            {ai.board.map(minion => (
              <button
                key={minion.instanceId}
                onClick={() => attack(player.board[0]?.instanceId, minion.instanceId)}
                className="bg-red-600 p-4 rounded w-32 hover:bg-red-500"
              >
                <div className="font-bold text-sm">{minion.name}</div>
                <div className="text-2xl mt-2">{minion.attack}/{minion.currentHealth}</div>
                <div className="text-xs mt-1">{minion.manaCost} mana</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Player Board */}
        <div className="mb-8">
          <div className="bg-blue-900/30 p-4 rounded min-h-[150px] flex gap-2">
            {player.board.map(minion => (
              <div
                key={minion.instanceId}
                className={`bg-blue-600 p-4 rounded w-32 ${minion.canAttack ? 'ring-2 ring-yellow-400' : ''}`}
              >
                <div className="font-bold text-sm">{minion.name}</div>
                <div className="text-2xl mt-2">{minion.attack}/{minion.currentHealth}</div>
                <div className="text-xs mt-1">{minion.manaCost} mana</div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-2xl">Your Health: {player.health}</span>
            <span className="text-xl">Mana: {player.mana}/{player.maxMana}</span>
          </div>
        </div>
        
        {/* Player Hand */}
        <div className="mb-8">
          <h2 className="text-xl mb-2">Your Hand</h2>
          <div className="flex gap-2 flex-wrap">
            {player.hand.map((card, index) => (
              <button
                key={`${card.id}-${index}`}
                onClick={() => playCard(index)}
                disabled={card.manaCost > player.mana || currentTurn !== 'player'}
                className={`p-4 rounded w-40 ${
                  card.type === 'minion' ? 'bg-green-600' : 'bg-purple-600'
                } ${card.manaCost > player.mana ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
              >
                <div className="font-bold text-sm">{card.name}</div>
                <div className="text-xs mt-1">{card.element}</div>
                {card.type === 'minion' && (
                  <div className="text-xl mt-2">{card.attack}/{card.health}</div>
                )}
                <div className="text-xs mt-1">{card.manaCost} mana</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={endTurn}
            disabled={currentTurn !== 'player' || gameOver}
            className="bg-yellow-600 hover:bg-yellow-500 px-8 py-3 rounded text-xl font-bold disabled:opacity-50"
          >
            End Turn
          </button>
          
          {gameOver && (
            <button
              onClick={resetBattle}
              className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded text-xl font-bold"
            >
              New Game
            </button>
          )}
        </div>
        
        {gameOver && (
          <div className="text-center mt-8 text-3xl font-bold">
            {winner === 'player' ? '🎉 You Win!' : '💀 You Lose!'}
          </div>
        )}
        
        <div className="text-center mt-4 text-sm text-gray-400">
          Turn {Math.ceil(useBattleStore.getState().turnNumber / 2)} - {currentTurn === 'player' ? 'Your Turn' : 'AI Turn'}
        </div>
      </div>
    </div>
  );
}