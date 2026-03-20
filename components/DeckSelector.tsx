'use client';

import { DeckArchetype } from '@/lib/types/game';
import { DECK_INFO } from '@/lib/game/deckManager';
import { DeckBuildMode } from '@/lib/game/deckManager';
import { CSS_COLORS as COLORS } from '@/lib/pixi/utils/StyleConstants';

interface DeckSelectorProps {
  selectedDeck: DeckArchetype | null;
  onSelectDeck: (archetype: DeckArchetype) => void;
  selectedMode: DeckBuildMode;
  onSelectMode: (mode: DeckBuildMode) => void;
  label: string;
}

// Element accent colors drawn from CSS_COLORS
const ELEMENT_STYLES: Record<string, { bg: string; border: string }> = {
  fire:    { bg: '#3b1a1a', border: COLORS.red },
  water:   { bg: '#1a2a3b', border: COLORS.blue },
  earth:   { bg: '#1a2e1a', border: COLORS.green },
  air:     { bg: '#2a1a3b', border: COLORS.purple },
  neutral: { bg: COLORS.darkBg, border: COLORS.gray },
};

export function DeckSelector({
  selectedDeck,
  onSelectDeck,
  selectedMode,
  onSelectMode,
  label,
}: DeckSelectorProps) {
  const decks: DeckArchetype[] = ['fire', 'earth'];

  return (
    <div style={{ width: '100%', maxWidth: 672 }}>
      <h2 style={{
        fontSize: 22,
        fontWeight: 700,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'monospace',
      }}>
        {label}
      </h2>

      {/* Deck archetype cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 8,
      }}>
        {decks.map((archetype) => {
          const info = DECK_INFO[archetype];
          const isSelected = selectedDeck === archetype;
          const styles = ELEMENT_STYLES[info.element] ?? ELEMENT_STYLES.neutral;

          return (
            <button
              key={archetype}
              onClick={() => onSelectDeck(archetype)}
              style={{
                position: 'relative',
                padding: 16,
                borderRadius: 8,
                border: `3px solid ${styles.border}`,
                background: styles.bg,
                cursor: 'pointer',
                outline: isSelected ? `3px solid ${COLORS.gold}` : 'none',
                outlineOffset: 2,
                opacity: isSelected ? 1 : 0.75,
                transition: 'opacity 0.15s, outline 0.15s',
                textAlign: 'center',
              }}
            >
              <h3 style={{
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.text,
                marginBottom: 6,
                fontFamily: 'monospace',
              }}>
                {info.name}
              </h3>
              <p style={{
                fontSize: 12,
                color: COLORS.subtext,
                marginBottom: 6,
                lineHeight: 1.4,
              }}>
                {info.description}
              </p>
              <p style={{
                fontSize: 11,
                color: COLORS.subtext,
                fontStyle: 'italic',
                lineHeight: 1.4,
              }}>
                {info.strategy}
              </p>

              {/* Selected checkmark */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: COLORS.gold,
                  border: `2px solid ${COLORS.text}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  color: COLORS.baseBg,
                  fontWeight: 700,
                }}>
                  ✔
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Slim mode toggle bar */}
      <div style={{
        display: 'flex',
        background: COLORS.darkBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: 4,
        gap: 4,
      }}>
        {(['structure', 'random'] as DeckBuildMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onSelectMode(mode)}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: selectedMode === mode ? '#2d3748' : 'transparent',
              color: selectedMode === mode ? COLORS.gold : COLORS.subtext,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'monospace',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {mode === 'structure' ? 'Structure Deck' : 'Random Deck'}
          </button>
        ))}
      </div>
    </div>
  );
}