import { Card as CardType, Minion } from '@/lib/types/game';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const ELEMENT_COLORS = {
  fire: 'from-red-600 to-orange-600',
  water: 'from-blue-600 to-cyan-600',
  earth: 'from-green-600 to-emerald-600',
  air: 'from-purple-600 to-pink-600',
  spirit: 'from-indigo-600 to-violet-600',
  neutral: 'from-gray-600 to-slate-600',
};

const ELEMENT_BORDERS = {
  fire: 'border-red-500',
  water: 'border-blue-500',
  earth: 'border-green-500',
  air: 'border-purple-500',
  spirit: 'border-indigo-500',
  neutral: 'border-gray-500',
};

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

export function Card({ card, onClick, disabled, isMinion, showHealth, compact = false, cardIndex, location }: CardProps) {
  const isMinionCard = card.type === 'minion';
  const minion = isMinion ? (card as Minion) : null;

  const uniqueCardId = useMemo(() => {
    if (minion?.instanceId) {
      // Board minions have instanceIds
      return minion.instanceId;
    } else if (location === 'hand' && cardIndex !== undefined) {
      // Hand cards: use base ID + position + timestamp for uniqueness
      return `${card.id}-hand-${cardIndex}-${Date.now()}`;
    } else {
      return `${card.id}-${location}-${Date.now()}`; // Fallback for copies in deck or unknown location
    }
  }, [card.id, minion?.instanceId, cardIndex, location]);
 
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      
      whileHover={!disabled ? { 
        scale: 1.05, 
        y: -10,
        transition: { duration: 0.2 }
      } : {}}
      
      whileTap={!disabled ? { scale: 0.95 } : {}}
      
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      
      onClick={onClick}
      disabled={disabled}
      className={`
        relative ${compact ? 'w-24 h-32' : 'w-40 h-56'} rounded-lg border-4 ${ELEMENT_BORDERS[card.element]}
        bg-gradient-to-b ${ELEMENT_COLORS[card.element]}
        shadow-lg
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isMinion && minion?.canAttack ? 'ring-4 ring-yellow-400' : ''}
      `}
    >
      {/* Mana Cost Badge */}
      <motion.div 
        className={`absolute -top-2 -left-2 ${compact ? 'w-6 h-6' : 'w-10 h-10'} rounded-full bg-blue-500 border-2 border-white flex items-center justify-center`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      >
        <span className={`${compact ? 'text-xs' : 'text-xl'} font-bold text-white`}>{card.manaCost}</span>
      </motion.div>
     
      {/* Card Name */}
      <div className={`absolute top-1 left-1 right-1 ${compact ? 'top-1' : 'top-2'}`}>
        <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-white text-center drop-shadow-lg line-clamp-1`}>
          {card.name}
        </h3>
      </div>
     
      {/* Card Art Placeholder */}
      <div className={`absolute ${compact ? 'top-6 left-2 right-2 h-12' : 'top-12 left-4 right-4 h-24'} bg-black/30 rounded flex items-center justify-center`}>
        <motion.span 
          className={compact ? 'text-xl' : 'text-4xl'}
          animate={isMinion && minion?.canAttack ? {
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatDelay: 0.5
          }}
        >
          {getElementIcon(card.element)}
        </motion.span>
      </div>
     
      {/* Description - Hide in compact mode */}
      {!compact && (
        <div className="absolute top-40 left-2 right-2 text-xs text-white/90 text-center px-2 line-clamp-2">
          {card.description}
        </div>
      )}
     
      {/* Stats for Minions */}
      {isMinionCard && (
        <>
          {/* Attack */}
          <div className={`absolute bottom-1 left-1 ${compact ? 'w-5 h-5' : 'w-8 h-8'} rounded-full bg-yellow-600 border-2 border-white flex items-center justify-center`}>
            <span className={compact ? 'text-xs' : 'text-sm'}>⚔️</span>
          </div>
          <motion.div 
            className={`absolute bottom-1 ${compact ? 'left-6 text-sm' : 'left-10 text-xl'} font-bold text-white drop-shadow-lg`}
            key={`attack-${uniqueCardId}-${card.attack}`}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.3 }}
          >
            {card.attack}
          </motion.div>
         
          {/* Health */}
          <div className={`absolute bottom-1 right-1 ${compact ? 'w-5 h-5' : 'w-8 h-8'} rounded-full bg-red-600 border-2 border-white flex items-center justify-center`}>
            <span className={compact ? 'text-xs' : 'text-sm'}>❤️</span>
          </div>
          <motion.div 
            className={`absolute bottom-1 ${compact ? 'right-6 text-sm' : 'right-10 text-xl'} font-bold text-white drop-shadow-lg`}
            key={`health-${uniqueCardId}-${showHealth && minion ? minion.currentHealth : card.health}`}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.3 }}
          >
            {showHealth && minion ? minion.currentHealth : card.health}
          </motion.div>
        </>
      )}
     
      {/* Rarity Gem */}
      <motion.div 
        className={`absolute top-1 right-1 ${compact ? 'w-3 h-3' : 'w-6 h-6'} rounded-full ${getRarityColor(card.rarity)}`}
        animate={card.rarity === 'legendary' ? {
          scale: [1, 1.2, 1],
          boxShadow: [
            '0 0 0px rgba(250, 204, 21, 0)',
            '0 0 20px rgba(250, 204, 21, 0.8)',
            '0 0 0px rgba(250, 204, 21, 0)'
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      />
    </motion.button>
  );
}

function getElementIcon(element: string): string {
  const icons = {
    fire: '🔥',
    water: '💧',
    earth: '🌿',
    air: '💨',
    spirit: '👻',
    neutral: '⚪',
  };
  return icons[element as keyof typeof icons] || '⚪';
}

function getRarityColor(rarity: string): string {
  const colors = {
    common: 'bg-gray-400',
    rare: 'bg-blue-400',
    epic: 'bg-purple-400',
    legendary: 'bg-yellow-400',
  };
  return colors[rarity as keyof typeof colors] || 'bg-gray-400';
}