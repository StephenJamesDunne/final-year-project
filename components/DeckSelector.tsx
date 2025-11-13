'use client';

import { DeckArchetype } from '@/lib/types/game';
import { DECK_INFO } from '@/lib/game/deckManager';
import { ELEMENT_COLORS, ELEMENT_BORDERS, ELEMENT_ICONS } from '@/lib/utils/constants';

interface DeckSelectorProps {
  selectedDeck: DeckArchetype | null;
  onSelectDeck: (archetype: DeckArchetype) => void;
  label: string;
}

export function DeckSelector({ selectedDeck, onSelectDeck, label }: DeckSelectorProps) {
  const decks: DeckArchetype[] = ['fire', 'water', 'earth', 'air'];

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">{label}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  {ELEMENT_ICONS[info.element]}
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