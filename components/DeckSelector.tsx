'use client';

import { DeckArchetype } from '@/lib/types/game';
import { DECK_INFO } from '@/lib/game/deckManager';

interface DeckSelectorProps {
  selectedDeck: DeckArchetype | null;
  onSelectDeck: (archetype: DeckArchetype) => void;
  label: string;
}

// Pixi uses hex color codes, but Tailwind uses utility classes for styling. 
// To bridge this gap, mappings are created to associate each element with its corresponding
// Tailwind classes for background gradients and borders.
const ELEMENT_COLORS = {
  fire: 'from-red-600 to-orange-600',
  water: 'from-blue-600 to-cyan-600',
  earth: 'from-green-600 to-emerald-600',
  air: 'from-purple-600 to-pink-600',
  spirit: 'from-indigo-600 to-violet-600',
  neutral: 'from-gray-600 to-slate-600',
} as const;

const ELEMENT_BORDERS = {
  fire: 'border-red-600',
  water: 'border-blue-600',
  earth: 'border-green-600',
  air: 'border-purple-600',
  spirit: 'border-indigo-600',
  neutral: 'border-gray-600',
} as const;

export function DeckSelector({ selectedDeck, onSelectDeck, label }: DeckSelectorProps) {
  const decks: DeckArchetype[] = ['fire', 'earth'];

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">{label}</h2>
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        {decks.map((archetype) => {
          const info = DECK_INFO[archetype];
          const isSelected = selectedDeck === archetype;

          return (
            <button
              key={archetype}
              onClick={() => onSelectDeck(archetype)}
              className={`
                relative p-4 rounded-lg border-4 transition-all
                ${ELEMENT_BORDERS[info.element]}
                bg-gradient-to-b ${ELEMENT_COLORS[info.element]}
                ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : 'hover:scale-102'}
                ${isSelected ? 'opacity-100' : 'opacity-80 hover:opacity-100'}
              `}
            >
              <div className="flex justify-center mb-4">
                <div className="text-6xl">
                  
                </div>
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">
                {info.name}
              </h3>
              <p className="text-sm text-white/90 text-center mb-2">
                {info.description}
              </p>
              <p className="text-xs text-white/70 italic text-center">
                {info.strategy}
              </p>
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-xl">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}