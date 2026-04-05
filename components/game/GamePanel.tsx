"use client";

import { useState } from 'react';
import { useBattleStore } from '@/lib/store/battleStore';
import { Card, Minion } from '@/lib/types/game';
import { AgentDebugData } from '@/lib/store/slices/battleSlice';

// Panel positioned to match Pixi combat log from BoardLayout.ts:
// x: width * 0.005, y: height * 0.198
// width: 320/1920 = 16.67%, height: 520/1080 = 48.15%
const PANEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '5.0%',
  top: '19.8%',
  width: '16.67%',
  height: '48.15%',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'sans-serif',
  zIndex: 10,
};

// Mini card dimensions for AI hand display in debug panel
const MINI_CARD_SCALE = 0.55;
const MINI_CARD_W = 100 * MINI_CARD_SCALE;
const MINI_CARD_H = 140 * MINI_CARD_SCALE;

// Element colour maps matching StyleConstants.ts
const ELEMENT_COLORS: Record<string, string> = {
  fire: '#dc2626',
  water: '#2563eb',
  earth: '#16a34a',
  air: '#9333ea',
  spirit: '#4f46e5',
  neutral: '#6b7280',
};

const ELEMENT_BORDER_COLORS: Record<string, string> = {
  fire: '#fbbf24',
  water: '#60a5fa',
  earth: '#4ade80',
  air: '#c084fc',
  spirit: '#818cf8',
  neutral: '#9ca3af',
};

// ── GamePanel ─────────────────────────────────────────────────────────────────

export function GamePanel() {
  const [activeTab, setActiveTab] = useState<'log' | 'debug'>('log');
  const [hoveredCard, setHoveredCard] = useState<{
    card: Card | Minion;
    x: number;
    y: number;
  } | null>(null);

  const combatLog = useBattleStore((state) => state.combatLog);
  const agentDebugData = useBattleStore((state) => state.agentDebugData);
  const debugMode = useBattleStore((state) => state.debugMode);
  const toggleDebugMode = useBattleStore((state) => state.toggleDebugMode);

  const handleCardHover = (card: Card | Minion, x: number, y: number) => {
    setHoveredCard({ card, x, y });
  };

  const handleCardHoverEnd = () => {
    setHoveredCard(null);
  };

  return (
    <>
      <div style={PANEL_STYLE}>

        {/* Tab bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(212,175,55,0.4)',
        }}>
          <TabButton
            label="Combat Log"
            active={activeTab === 'log'}
            onClick={() => {
              setActiveTab('log');
              if (debugMode) toggleDebugMode();
            }}
          />
          <TabButton
            label="Agent Debug"
            active={activeTab === 'debug'}
            onClick={() => {
              setActiveTab('debug');
              if (!debugMode) toggleDebugMode();
            }}
          />
        </div>

        {/* Panel content */}
        <div style={{
          flex: 1,
          background: 'rgba(30, 41, 59, 0.88)',
          border: '1px solid rgba(71, 85, 105, 0.6)',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          {activeTab === 'log'
            ? <CombatLogContent combatLog={combatLog} />
            : <DebugContent
                data={agentDebugData}
                onCardHover={handleCardHover}
                onCardHoverEnd={handleCardHoverEnd}
              />
          }
        </div>
      </div>

      {/* Tooltip rendered outside panel div so it's never clipped by panel overflow */}
      {hoveredCard && (
        <CardTooltip
          card={hoveredCard.card}
          x={hoveredCard.x}
          y={hoveredCard.y}
        />
      )}
    </>
  );
}

// ── Tab Button ────────────────────────────────────────────────────────────────

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '6px 0',
        fontSize: '11px',
        fontWeight: active ? 700 : 400,
        color: active ? '#fbbf24' : '#94a3b8',
        background: active ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.85)',
        border: 'none',
        borderBottom: active ? '2px solid #fbbf24' : '2px solid transparent',
        cursor: 'pointer',
        letterSpacing: '0.03em',
        transition: 'color 0.15s, border-color 0.15s',
      }}
    >
      {label}
    </button>
  );
}

// ── Combat Log Content ────────────────────────────────────────────────────────

interface CombatLogContentProps {
  combatLog: string[];
}

function CombatLogContent({ combatLog }: CombatLogContentProps) {
  const recent = [...combatLog].reverse().slice(0, 12);

  return (
    <div style={{ padding: '10px 12px' }}>
      <p style={{
        fontSize: '20px',
        fontWeight: 700,
        color: '#fbbf24',
        marginBottom: '8px',
        textAlign: 'center',
      }}>
        Combat Log
      </p>
      <div style={{
        height: '1px',
        background: 'rgba(71, 85, 105, 0.5)',
        marginBottom: '8px',
      }} />
      {recent.length === 0 && (
        <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
          No events yet.
        </p>
      )}
      {recent.map((entry, i) => (
        <p key={i} style={{
          fontSize: '13px',
          lineHeight: '1.5',
          color: entry.includes('VICTORY') || entry.includes('DEFEAT')
            ? '#fbbf24'
            : '#e2e8f0',
          fontWeight: entry.startsWith('═') || entry.startsWith('─') ? 700 : 400,
          marginBottom: '4px',
        }}>
          {entry.startsWith('═') || entry.startsWith('─') ? entry : `• ${entry}`}
        </p>
      ))}
    </div>
  );
}

// ── Debug Content ─────────────────────────────────────────────────────────────

interface DebugContentProps {
  data: AgentDebugData | null;
  onCardHover: (card: Card | Minion, x: number, y: number) => void;
  onCardHoverEnd: () => void;
}

function DebugContent({ data, onCardHover, onCardHoverEnd }: DebugContentProps) {
  if (!data) {
    return (
      <div style={{ padding: '16px 12px' }}>
        <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
          Waiting for AI turn...
        </p>
      </div>
    );
  }

  const allQValues = data.topActions.map(a => a.qValue);
  const maxQ = Math.max(...allQValues);
  const minQ = Math.min(...allQValues);
  const qRange = maxQ - minQ || 1;

  return (
    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* Q-value bars */}
      <div>
        <p style={{
          fontSize: '10px',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '6px',
        }}>
          Top Actions
        </p>
        {data.topActions.map((action, i) => {
          const isChosen = action.index === data.chosenAction.index;
          const barWidth = ((action.qValue - minQ) / qRange) * 100;

          return (
            <div key={i} style={{ marginBottom: '5px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
                color: isChosen ? '#fbbf24' : '#cbd5e1',
                fontWeight: isChosen ? 700 : 400,
                marginBottom: '2px',
              }}>
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '75%',
                }}>
                  {isChosen ? '▶ ' : ''}{action.description}
                </span>
                <span style={{ flexShrink: 0, marginLeft: '4px' }}>
                  {action.qValue.toFixed(2)}
                </span>
              </div>
              <div style={{
                height: '5px',
                background: 'rgba(71, 85, 105, 0.4)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${barWidth}%`,
                  background: isChosen ? '#fbbf24' : '#3b82f6',
                  borderRadius: '3px',
                  transition: 'width 0.2s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: '1px', background: 'rgba(71, 85, 105, 0.4)' }} />

      {/* AI Hand */}
      <div>
        <p style={{
          fontSize: '10px',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '6px',
        }}>
          AI Hand ({data.aiHand.length} cards)
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {data.aiHand.map((card, i) => (
            <MiniCard
              key={i}
              card={card}
              onCardHover={onCardHover}
              onCardHoverEnd={onCardHoverEnd}
            />
          ))}
          {data.aiHand.length === 0 && (
            <p style={{ fontSize: '10px', color: '#64748b' }}>Empty hand</p>
          )}
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(71, 85, 105, 0.4)' }} />

      {/* Next Draw */}
      <div>
        <p style={{
          fontSize: '10px',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '6px',
        }}>
          Next Draw
        </p>
        {data.nextDraw
          ? <MiniCard
              card={data.nextDraw}
              onCardHover={onCardHover}
              onCardHoverEnd={onCardHoverEnd}
            />
          : <p style={{ fontSize: '10px', color: '#64748b' }}>Deck empty</p>
        }
      </div>
    </div>
  );
}

// ── Mini Card ─────────────────────────────────────────────────────────────────

interface MiniCardProps {
  card: Card | Minion;
  onCardHover: (card: Card | Minion, x: number, y: number) => void;
  onCardHoverEnd: () => void;
}

function MiniCard({ card, onCardHover, onCardHoverEnd }: MiniCardProps) {
  const borderColor = ELEMENT_BORDER_COLORS[card.element] ?? '#9ca3af';
  const elementColor = ELEMENT_COLORS[card.element] ?? '#6b7280';

  const isMinion = card.type === 'minion';
  const isBoardMinion = 'instanceId' in card;
  const attack = isMinion
    ? (isBoardMinion ? (card as Minion).attack : (card as Card).attack)
    : undefined;
  const health = isMinion
    ? (card as Minion).health
    : isMinion ? (card as Card).health : undefined;

  return (
    <div
      onMouseEnter={(e) => onCardHover(card, e.clientX, e.clientY)}
      onMouseLeave={onCardHoverEnd}
      style={{
        position: 'relative',
        width: MINI_CARD_W,
        height: MINI_CARD_H,
        borderRadius: '4px',
        background: '#2a1a0e',
        border: `2px solid ${borderColor}`,
        cursor: 'pointer',
        flexShrink: 0,
        overflow: 'visible',
      }}
    >
      {/* Element tint */}
      <div style={{
        position: 'absolute',
        top: '7px',
        left: '3px',
        right: '3px',
        height: '60%',
        borderRadius: '3px',
        background: elementColor,
        opacity: 0.18,
      }} />

      {/* Name banner */}
      <div style={{
        position: 'absolute',
        bottom: '14px',
        left: '2px',
        right: '2px',
        background: 'rgba(30,41,59,0.92)',
        borderRadius: '2px',
        padding: '1px 2px',
        textAlign: 'center',
      }}>
        <span style={{
          fontSize: '6px',
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.2,
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {card.name}
        </span>
      </div>

      {/* Mana crystal — top left */}
      <Badge value={card.manaCost} color="#3b82f6" top={-6} left={-6} />

      {/* Attack badge — bottom left */}
      {isMinion && attack !== undefined && (
        <Badge value={attack} color="#dc2626" bottom={-6} left={-6} />
      )}

      {/* Health badge — bottom right */}
      {isMinion && health !== undefined && (
        <Badge
          value={health}
          color='#16a34a'
          bottom={-6}
          right={-6}
        />
      )}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────

interface BadgeProps {
  value: number;
  color: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  size?: number;    // diameter in px, defaults to 14
  fontSize?: number; // defaults to 7
}

function Badge({ value, color, top, bottom, left, right, size = 14, fontSize = 7 }: BadgeProps) {
  return (
    <div style={{
      position: 'absolute',
      top,
      bottom,
      left,
      right,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: color,
      border: '1px solid #fbbf24',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${fontSize}px`,
      fontWeight: 700,
      color: '#ffffff',
      zIndex: 2,
    }}>
      {value}
    </div>
  );
}

// ── Card Tooltip ──────────────────────────────────────────────────────────────

const TOOLTIP_W = 200;
const TOOLTIP_H = 280;
const TOOLTIP_OFFSET = 16;
const TOOLTIP_PADDING = 10;

interface CardTooltipProps {
  card: Card | Minion;
  x: number;
  y: number;
}

function CardTooltip({ card, x, y }: CardTooltipProps) {
  const borderColor = ELEMENT_BORDER_COLORS[card.element] ?? '#9ca3af';
  const elementColor = ELEMENT_COLORS[card.element] ?? '#6b7280';

  const isMinion = card.type === 'minion';
  const isBoardMinion = 'instanceId' in card;
  const attack = isMinion
    ? (isBoardMinion ? (card as Minion).attack : (card as Card).attack)
    : undefined;
  const health = isMinion
    ? (card as Minion).health
    : isMinion ? (card as Card).health : undefined;
  const isDamaged = isBoardMinion
    ? (card as Minion).currentHealth < (card as Minion).health
    : false;

  // Position tooltip to the right of cursor, flip left if near right edge
  const wouldOverflowRight = x + TOOLTIP_OFFSET + TOOLTIP_W > window.innerWidth - TOOLTIP_PADDING;
  const tooltipX = wouldOverflowRight
    ? x - TOOLTIP_W - TOOLTIP_OFFSET
    : x + TOOLTIP_OFFSET;

  // Clamp vertically
  let tooltipY = y - TOOLTIP_H / 2;
  if (tooltipY < TOOLTIP_PADDING) tooltipY = TOOLTIP_PADDING;
  if (tooltipY + TOOLTIP_H > window.innerHeight - TOOLTIP_PADDING) {
    tooltipY = window.innerHeight - TOOLTIP_H - TOOLTIP_PADDING;
  }

  // Build ability lines
  const lines: string[] = [];
  if (card.abilities && card.abilities.length > 0) {
    const triggerLabels: Record<string, string> = {
      battlecry: 'Battlecry',
      deathrattle: 'Deathrattle',
      passive: 'Passive',
      end_of_turn: 'End of Turn',
      start_of_turn: 'Start of Turn',
      when_attack: 'On Attack',
    };
    for (const ability of card.abilities) {
      const label = triggerLabels[ability.trigger] ?? ability.trigger;
      lines.push(`${label}: ${ability.description}`);
    }
  } else if (card.description) {
    lines.push(card.description);
  }

  return (
    <div style={{
      position: 'fixed',
      left: tooltipX,
      top: tooltipY,
      width: TOOLTIP_W,
      height: TOOLTIP_H,
      background: '#2a1a0e',
      border: `3px solid #d4af37`,
      borderRadius: '8px',
      zIndex: 1000,
      pointerEvents: 'none',
      overflow: 'visible',
      boxShadow: `0 0 12px rgba(0,0,0,0.6), inset 0 0 0 1px ${borderColor}44`,
    }}>

      {/* Art area */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '6px',
        right: '6px',
        height: '110px',
        borderRadius: '4px',
        background: '#333333',
        overflow: 'hidden',
      }}>
        {/* Element tint over placeholder */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: elementColor,
          opacity: 0.18,
        }} />
      </div>

      {/* Name banner - overlaps bottom of art */}
      <div style={{
        position: 'absolute',
        top: '108px',
        left: '4px',
        right: '4px',
        height: '26px',
        background: 'rgba(30,41,59,0.95)',
        border: '1px solid rgba(212,175,55,0.8)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 6px',
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#ffffff',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}>
          {card.name}
        </span>
      </div>

      {/* Info area — abilities / description */}
      <div style={{
        position: 'absolute',
        top: '140px',
        left: '4px',
        right: '4px',
        bottom: '24px',
        background: 'rgba(30,41,59,0.75)',
        borderRadius: '4px',
        padding: '6px 8px',
        overflowY: 'auto',
      }}>
        {lines.length === 0 && (
          <p style={{ fontSize: '9px', color: '#64748b', fontStyle: 'italic' }}>
            No abilities.
          </p>
        )}
        {lines.map((line, i) => (
          <p key={i} style={{
            fontSize: '9.5px',
            color: '#e2e8f0',
            lineHeight: '1.4',
            marginBottom: '4px',
          }}>
            {line}
          </p>
        ))}
      </div>

      {/* Mana crystal — top left */}
      <Badge value={card.manaCost} color="#3b82f6" top={-10} left={-10} size={22} fontSize={11} />

      {/* Attack — bottom left */}
      {isMinion && attack !== undefined && (
        <Badge value={attack} color="#dc2626" bottom={-10} left={-10} size={22} fontSize={11} />
      )}

      {/* Health — bottom right */}
      {isMinion && health !== undefined && (
        <Badge
          value={health}
          color={isDamaged ? '#dc2626' : '#16a34a'}
          bottom={-10}
          right={-10}
          size={22}
          fontSize={11}
        />
      )}
    </div>
  );
}