import { Card } from '../types/game';

export const CARDS: Card[] = [
  // Fire
  { id: 'f1', name: 'Scáthach', element: 'fire', type: 'minion', rarity: 'epic', manaCost: 4, attack: 4, health: 3, description: 'Warrior trainer' },
  { id: 'f2', name: 'Beltane Flames', element: 'fire', type: 'spell', rarity: 'common', manaCost: 3, description: 'Deal 3 damage' },
  { id: 'f3', name: 'Red Branch Knight', element: 'fire', type: 'minion', rarity: 'common', manaCost: 2, attack: 2, health: 2, description: 'Elite warrior' },
  
  // Water
  { id: 'w1', name: 'Salmon of Knowledge', element: 'water', type: 'spell', rarity: 'rare', manaCost: 2, description: 'Draw 2 cards' },
  { id: 'w2', name: 'Selkie', element: 'water', type: 'minion', rarity: 'common', manaCost: 3, attack: 2, health: 4, description: 'Seal shapeshifter' },
  { id: 'w3', name: "Manannán's Tide", element: 'water', type: 'spell', rarity: 'epic', manaCost: 4, description: 'Return a minion to hand' },
  
  // Earth
  { id: 'e1', name: "Dagda's Blessing", element: 'earth', type: 'spell', rarity: 'common', manaCost: 2, description: 'Heal 5 health' },
  { id: 'e2', name: 'Fir Bolg Warrior', element: 'earth', type: 'minion', rarity: 'common', manaCost: 3, attack: 2, health: 5, description: 'Sturdy defender' },
  { id: 'e3', name: 'Druid of the Grove', element: 'earth', type: 'minion', rarity: 'rare', manaCost: 4, attack: 3, health: 4, description: 'Nature keeper' },
  
  // Air
  { id: 'a1', name: 'Púca', element: 'air', type: 'minion', rarity: 'common', manaCost: 1, attack: 1, health: 1, description: 'Shapeshifter' },
  { id: 'a2', name: 'Leprechaun', element: 'air', type: 'minion', rarity: 'common', manaCost: 2, attack: 2, health: 1, description: 'Tricky fellow' },
  { id: 'a3', name: 'Swift Wind', element: 'air', type: 'spell', rarity: 'common', manaCost: 1, description: 'Draw 1 card' },
  
  // Spirit
  { id: 's1', name: 'Banshee', element: 'spirit', type: 'minion', rarity: 'rare', manaCost: 3, attack: 2, health: 2, description: 'Wailing spirit' },
  { id: 's2', name: "Death's Touch", element: 'spirit', type: 'spell', rarity: 'rare', manaCost: 4, description: 'Destroy a minion' },
  { id: 's3', name: 'Changeling', element: 'spirit', type: 'minion', rarity: 'common', manaCost: 2, attack: 1, health: 1, description: 'Fairy substitute' },
];