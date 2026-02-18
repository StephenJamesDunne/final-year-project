import { Card, DeckArchetype, DeckInfo } from "../types/game";
import { getArchetypeCards } from "../data/cards";

// Check if running in client environment
// this is important for shuffling decks only on the client side.
// If we shuffle on the server, it can lead to inconsistent game states,
// because server and client would have different deck orders
const isClient = typeof window !== "undefined";

// Shuffle an array using Fisher-Yates algorithm:
// most reliable method I've found for unbiased shuffling of a deck
// How it works: iterate backwards through the deck array.
// For each position, pick a random index from 0 to current position.
// Swap the elements at the current position and the random index.
// This ensures each permutation of the array is equally likely.
export function shuffleDeck<T>(array: T[]): T[] {
  const shuffledDeck = [...array];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
}

// Create a deck based on chosen archetype
// Basically just a fancy if else that gets the right set of cards
export function createArchetypeDeck(archetype: DeckArchetype): Card[] {
  const archetypeCards = getArchetypeCards(
    archetype === "fire" ? "aggressive" : "defensive",
  );

  // Create 2 copies of each card (standard deck building)
  const baseDeck = archetypeCards.flatMap((card, index) => [
    { ...card, id: `${card.id}-copy1-${index}` },
    { ...card, id: `${card.id}-copy2-${index}` },
  ]);

  return isClient ? shuffleDeck(baseDeck) : baseDeck;
}

// Take the deck (array of type Card) and draw 'count' number of cards from the top
// Returns an array of drawn cards, and remaining deck array.
// Now updated to account for fatigue damage if the deck is empty
export function drawCards(
  deck: Card[],
  count: number,
): { drawn: Card[]; remaining: Card[]; cardsMissing: number } {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);

  const cardsMissing = Math.max(0, count - drawn.length);

  return { drawn, remaining, cardsMissing };
}

// Boolean function to check if a card can be played based on available mana
export function canPlayCard(card: Card, availableMana: number): boolean {
  return card.manaCost <= availableMana;
}

// For basic AI: Find the index of the first playable card in hand based on available mana
export function findPlayableCard(hand: Card[], availableMana: number): number {
  return hand.findIndex((card) => canPlayCard(card, availableMana));
}

// Remove a card from hand by index and return the new hand array
export function removeCardFromHand(hand: Card[], cardIndex: number): Card[] {
  return hand.filter((_, index) => index !== cardIndex);
}

// Add new cards to hand and return the updated hand array
// This is different to drawing cards from the deck,
// because certain abilities/spells may add cards to hand directly.
export function addCardsToHand(hand: Card[], newCards: Card[]): Card[] {
  return [...hand, ...newCards];
}

// Record uses DeckArchetype as key and DeckInfo as value.
// This is done so that deck info can be easily accessed based on archetype.
// Calling DECK_INFO['fire'] will return all info related to the Fire deck archetype.
export const DECK_INFO: Record<DeckArchetype, DeckInfo> = {
  fire: {
    archetype: "fire",
    name: "Fire - Connacht Warriors",
    description: "Aggressive deck focused on direct damage and fast minions",
    element: "fire",
    strategy: "Deal damage quickly with burn spells and aggressive minions",
  },
  water: {
    archetype: "water",
    name: "Water - Leinster Wisdom",
    description: "Tempo deck with card draw and efficient minions",
    element: "water",
    strategy: "Control the board with smart trades and card advantage",
  },
  earth: {
    archetype: "earth",
    name: "Earth - Munster Endurance",
    description: "Defensive deck with healing and high-health minions",
    element: "earth",
    strategy: "Survive early aggression and win with late-game power",
  },
  air: {
    archetype: "air",
    name: "Air - Ulster Cunning",
    description: "Balanced deck with flexible answers and disruption",
    element: "air",
    strategy: "Adapt to your opponent with versatile spells and minions",
  },
};
