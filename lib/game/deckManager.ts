import { isClient } from '../utils/clientUtils';
import { Card, DeckArchetype, DeckInfo } from '../types/game';
import { CARDS, getArchetypeCards } from '../data/cards';

export function shuffleDeck<T>(array: T[]): T[] {
  const shuffledDeck = [...array];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
}

export function createArchetypeDeck(archetype: DeckArchetype): Card[] {
  const archetypeCards = getArchetypeCards(
    archetype === 'fire' ? 'aggressive' :
    archetype === 'water' ? 'tempo' :
    archetype === 'earth' ? 'defensive' :
    'balanced'
  );

  // Create 2 copies of each card (standard deck building)
  const baseDeck = archetypeCards.flatMap((card, index) => [
    { ...card, id: `${card.id}-copy1-${index}` },
    { ...card, id: `${card.id}-copy2-${index}` }
  ]);

  return isClient ? shuffleDeck(baseDeck) : baseDeck;
}

// Add new function for client-side deck initialization
export function initializeClientDeck(serverDeck: Card[]): Card[] {
  return isClient ? shuffleDeck([...serverDeck]) : serverDeck;
}

export function drawCards(deck: Card[], count: number): { drawn: Card[], remaining: Card[] } {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

export function canPlayCard(card: Card, availableMana: number): boolean {
  return card.manaCost <= availableMana;
}

export function findPlayableCard(hand: Card[], availableMana: number): number {
  return hand.findIndex(card => canPlayCard(card, availableMana));
}

export function removeCardFromHand(hand: Card[], cardIndex: number): Card[] {
  return hand.filter((_, index) => index !== cardIndex);
}

export function addCardsToHand(hand: Card[], newCards: Card[]): Card[] {
  return [...hand, ...newCards];
}

export const DECK_INFO: Record<DeckArchetype, DeckInfo> = {
  fire: {
    archetype: 'fire',
    name: 'Fire - Connacht Warriors',
    description: 'Aggressive deck focused on direct damage and fast minions',
    element: 'fire',
    strategy: 'Deal damage quickly with burn spells and aggressive minions'
  },
  water: {
    archetype: 'water',
    name: 'Water - Leinster Wisdom',
    description: 'Tempo deck with card draw and efficient minions',
    element: 'water',
    strategy: 'Control the board with smart trades and card advantage'
  },
  earth: {
    archetype: 'earth',
    name: 'Earth - Munster Endurance',
    description: 'Defensive deck with healing and high-health minions',
    element: 'earth',
    strategy: 'Survive early aggression and win with late-game power'
  },
  air: {
    archetype: 'air',
    name: 'Air - Ulster Cunning',
    description: 'Balanced deck with flexible answers and disruption',
    element: 'air',
    strategy: 'Adapt to your opponent with versatile spells and minions'
  }
};