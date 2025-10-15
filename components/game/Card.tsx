import { Card as CardType, Minion, Element} from '@/lib/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ELEMENT_COLORS, ELEMENT_BORDERS, ELEMENT_ICONS } from '@/lib/utils/constants';

const HOVER_ANIMATION = () => ({});

const TAP_ANIMATION = (disabled: boolean) =>
  !disabled ? { scale: 0.95 } : {};

// Utility functions
function generateUniqueCardId(card: CardType | Minion, location?: string, cardIndex?: number): string {
  if ('instanceId' in card) {
    return card.instanceId;
  }
  return `${card.id}-${location || 'unknown'}-${cardIndex || 0}`;
}

function getElementIcon(element: Element): string {
  const icons: Record<Element, string> = {
    fire: '🔥',
    water: '💧',
    earth: '🌿',
    air: '💨',
    spirit: '👻',
    neutral: '⚪',
  };
  return icons[element];
}

function getCardClassNames(
  card: CardType | Minion,
  isMinion: boolean,
  disabled: boolean,
  compact: boolean
): string {
  const minion = isMinion ? (card as Minion) : null;

  return `
    relative ${compact ? 'w-24 h-32' : 'w-40 h-56'} 
    rounded-lg border-4 ${ELEMENT_BORDERS[card.element]}
    bg-gradient-to-b ${ELEMENT_COLORS[card.element]}
    shadow-lg
    ${disabled ? 'opacity-50' : ''}
    ${isMinion && minion?.canAttack ? 'ring-4 ring-yellow-400' : ''}
  `;
}

// Props interface
interface CardProps {
  card: CardType | Minion;
  onClick?: () => void;
  disabled?: boolean;
  isMinion?: boolean;
  showHealth?: boolean;
  compact?: boolean;
  cardIndex?: number;
  location?: 'hand' | 'board' | 'deck';
}

// Card Detail Component for Hover/Inspect functionality
function CardDetail({
  card,
  isMinion,
  showHealth,
  position
}: {
  card: CardType | Minion;
  isMinion?: boolean;
  showHealth?: boolean;
  position: { x: number, y: number };
}) {
  const isMinionCard = card.type === 'minion';
  const minion = isMinion ? (card as Minion) : null;

  // Calculate position to keep card on screen
  const adjustedPosition = {
    x: Math.min(Math.max(position.x, 20), window.innerWidth - 320),
    y: Math.min(Math.max(position.y, 20), window.innerHeight - 480)
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="fixed z-50 pointer-events-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className={`relative w-80 h-[450px] rounded-lg border-4 ${ELEMENT_BORDERS[card.element]} bg-gradient-to-b ${ELEMENT_COLORS[card.element]} shadow-2xl`}>
        {/* Mana Cost Badge */}
        <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{card.manaCost}</span>
        </div>

        {/* Card Name */}
        <div className="absolute top-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white text-center drop-shadow-lg">
            {card.name}
          </h3>
        </div>

        {/* Card Art */}
        <div className="absolute top-12 left-4 right-4 h-56 bg-black/30 rounded overflow-hidden flex items-center justify-center">
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white/50 italic">No Image</div>
          )}
        </div>

        {/* Description */}
        <div className="absolute top-72 left-4 right-4 text-sm text-white/90 px-2">
          <div className="bg-black/70 p-3 rounded text-center border-2 border-white/30">
            <p className="text-sm">{card.description}</p>
          </div>
        </div>

        {/* Stats for Minions */}
        {isMinionCard && (
          <>
            {/* Attack */}
            <div className="absolute -bottom-3 -left-3 w-12 h-12 rounded-full bg-yellow-600 border-2 border-white flex items-center justify-center">
              <span className="text-2xl">⚔️</span>
            </div>
            <div className="absolute bottom-0 left-10 text-2xl font-bold text-white drop-shadow-lg">
              {card.attack}
            </div>

            {/* Health */}
            <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-red-600 border-2 border-white flex items-center justify-center">
              <span className="text-2xl">❤️</span>
            </div>
            <div className="absolute bottom-0 right-10 text-2xl font-bold text-white drop-shadow-lg">
              {showHealth && minion ? minion.currentHealth : card.health}
            </div>
          </>
        )}

        {/* Element Icon */}
        <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-black/60 border-2 border-white flex items-center justify-center">
          <span className="text-2xl">
            {getElementIcon(card.element)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Main Card Component
export function Card({
  card,
  onClick,
  disabled = false,
  isMinion = false,
  showHealth = false,
  compact = false,
  cardIndex,
  location = 'hand'
}: CardProps) {
  const isMinionCard = card.type === 'minion';
  const minion = isMinion ? (card as Minion) : null;
  const cardRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // State for hover to view detail
  const [showDetail, setShowDetail] = useState(false);
  const [detailPosition, setDetailPosition] = useState({ x: 0, y: 0 });

  const uniqueCardId = useMemo(
    () => generateUniqueCardId(card, location, cardIndex),
    [card, location, cardIndex]
  );

  // Handle hover to show card detail
  const handleMouseEnter = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDetailPosition({
        x: rect.right + 20,
        y: rect.top - 50
      });
      setShowDetail(true);
    }
  };

  const handleMouseLeave = () => {
    setShowDetail(false);
  };

  return (
    <>
      <div
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        <motion.button
          ref={cardRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={HOVER_ANIMATION()}
          whileTap={TAP_ANIMATION(disabled)}
          onClick={onClick}
          disabled={disabled}
          className={getCardClassNames(card, isMinion, disabled, compact)}
        >
          {/* Mana Cost Badge */}
          {location !== 'board' && (
            <div className={`absolute -top-2 -left-2 ${compact ? 'w-6 h-6' : 'w-10 h-10'} rounded-full bg-blue-500 border-2 border-white flex items-center justify-center`}>
              <span className={`${compact ? 'text-xs' : 'text-xl'} font-bold text-white`}>{card.manaCost}</span>
            </div>
          )}

          {/* Card Art */}
          <div className={`absolute ${compact ? 'top-4 left-1 right-1 h-16' : 'top-8 left-2 right-2 h-32'} bg-black/30 rounded overflow-hidden flex items-center justify-center`}>
            {card.imageUrl && (
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Stats for Minions */}
          {isMinionCard && (
            <>
              {/* Attack */}
              <div className={`absolute ${compact ? '-bottom-1 -left-1 w-5 h-5' : '-bottom-2 -left-2 w-10 h-10'} rounded-full bg-yellow-600 border-2 border-white flex items-center justify-center`}>
                <span className={compact ? 'text-xs' : 'text-xl'}>⚔️</span>
              </div>
              <div
                key={`attack-${uniqueCardId}`}
                className={`absolute ${compact ? 'bottom-0 left-4 text-sm' : 'bottom-1 left-9 text-xl'} font-bold text-white drop-shadow-lg`}
              >
                {card.attack}
              </div>

              {/* Health */}
              <div className={`absolute ${compact ? '-bottom-1 -right-1 w-5 h-5' : '-bottom-2 -right-2 w-10 h-10'} rounded-full bg-red-600 border-2 border-white flex items-center justify-center`}>
                <span className={compact ? 'text-xs' : 'text-xl'}>❤️</span>
              </div>
              <div
                key={`health-${uniqueCardId}`}
                className={`absolute ${compact ? 'bottom-0 right-4 text-sm' : 'bottom-1 right-9 text-xl'} font-bold text-white drop-shadow-lg`}
              >
                {showHealth && minion ? minion.currentHealth : card.health}
              </div>
            </>
          )}

          {/* Element Icon - replaces rarity gem */}
          <div className={`absolute ${compact ? '-top-1 -right-1 w-5 h-5' : '-top-2 -right-2 w-10 h-10'} rounded-full bg-black/60 border-2 border-white flex items-center justify-center`}>
            <span className={compact ? 'text-xs' : 'text-xl'}>
              {getElementIcon(card.element)}
            </span>
          </div>
        </motion.button>
      </div>

      {/* Render card detail on hover using portal */}
      {typeof window !== 'undefined' && showDetail && createPortal(
        <AnimatePresence>
          <CardDetail
            card={card}
            isMinion={isMinion}
            showHealth={showHealth}
            position={detailPosition}
          />
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}