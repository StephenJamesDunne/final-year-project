// For card related helper functions

import { Card as CardType, Minion, Element } from '@/lib/types/game';
import { ELEMENT_ICONS, CARD_SIZES, ELEMENT_COLORS, ELEMENT_BORDERS } from './constants';

// Card ID generation functions
export function generateUniqueCardId(card: CardType | Minion, location?: string, cardIndex?: number): string {
  if ('instanceId' in card) {
    return card.instanceId;
  }
  return `${card.id}-${location || 'unknown'}-${cardIndex || 0}`;
}

export function generateCardId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Card display/styling functions
export function getElementIcon(element: Element): string {
  return ELEMENT_ICONS[element];
}

export function getCardClassNames(
  card: CardType | Minion,
  isMinion: boolean,
  disabled: boolean,
  compact: boolean
): string {
  const minion = isMinion ? (card as Minion) : null;
  const size = compact ? CARD_SIZES.compact : CARD_SIZES.normal;

  return `
    relative ${size.width} ${size.height}
    rounded-lg border-4 ${ELEMENT_BORDERS[card.element]}
    bg-gradient-to-b ${ELEMENT_COLORS[card.element]}
    shadow-lg
    ${disabled ? 'opacity-50' : ''}
    ${isMinion && minion?.canAttack ? 'ring-4 ring-yellow-400' : ''}
  `.trim().replace(/\s+/g, ' '); // Clean up whitespace
}

// Card name formatting functions
export function formatCardName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

export function capitalizeCardName(name: string): string {
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Card validation functions
export function isValidCard(card: Partial<CardType>): boolean {
  return !!(
    card.id &&
    card.name &&
    card.element &&
    card.type &&
    card.rarity &&
    typeof card.manaCost === 'number' &&
    card.manaCost >= 0
  );
}

export function isMinion(card: CardType | Minion): card is Minion {
  return 'instanceId' in card || card.type === 'minion';
}

// Card filtering/searching functions
export function filterCardsByElement(cards: CardType[], element: Element): CardType[] {
  return cards.filter(card => card.element === element);
}

export function filterCardsByType(cards: CardType[], type: 'minion' | 'spell'): CardType[] {
  return cards.filter(card => card.type === type);
}

export function searchCards(cards: CardType[], query: string): CardType[] {
  const lowercaseQuery = query.toLowerCase();
  return cards.filter(card => 
    card.name.toLowerCase().includes(lowercaseQuery) ||
    card.description.toLowerCase().includes(lowercaseQuery)
  );
}