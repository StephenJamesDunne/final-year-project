import { Card } from '../types/game';
import { CARDS } from '../data/cards';

export function shuffleDeck<T>(array: T[]): T[] {
  const shuffledDeck = [...array];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
}

export function createStartingDeck(): Card[] {
  // Simple: 2 copies of each card
  const deck = CARDS.flatMap(card => [
    { ...card, id: `${card.id}-copy1` },
    { ...card, id: `${card.id}-copy2` }
  ]);

  // Only shuffle if we're on the client side
  if (typeof window !== 'undefined') {
    return shuffleDeck(deck);
  }

  // Return unshuffled deck for SSR
  return deck;
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