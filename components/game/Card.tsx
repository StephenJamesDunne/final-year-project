import { Card as CardType, Minion } from '@/lib/types/game';

interface CardProps {
  card: CardType | Minion;
  onClick?: () => void;
  disabled?: boolean;
  isMinion?: boolean;
  showHealth?: boolean;
  compact?: boolean;
  location?: 'hand' | 'board' | 'deck';
}

export function Card({
  card,
  onClick,
  disabled = false,
  compact = false,
  location = 'hand'
}: CardProps) {

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative ${compact ? 'w-24 h-32' : 'w-40 h-56'} 
        rounded-lg border-4 border-gray-700
        bg-gradient-to-b from-gray-800 to-gray-900
        shadow-lg
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}
      `}
    >
      {location !== 'board' && (
        <div className={`absolute -top-2 -left-2 ${compact ? 'w-6 h-6' : 'w-10 h-10'} rounded-full bg-blue-500 border-2 border-white flex items-center justify-center`}>
          <span className={`${compact ? 'text-xs' : 'text-xl'} font-bold text-white`}>{card.manaCost}</span>
        </div>
      )}

      <div className={`absolute ${compact ? 'top-4 left-1 right-1 h-16' : 'top-8 left-2 right-2 h-32'} bg-black/30 rounded overflow-hidden flex items-center justify-center`}>
        {card.imageUrl && (
          <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
        )}
      </div>
    </button>
  );
}