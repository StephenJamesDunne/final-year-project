import { Card } from '../types/game';

export const CARDS: Card[] = [
  // FIRE LEGENDARIES
  {
    id: 'f_leg_1',
    name: 'Queen Maedhbh',
    element: 'fire',
    type: 'minion',
    rarity: 'legendary',
    manaCost: 7,
    attack: 6,
    health: 6,
    description: 'Battlecry: Summon two 2/2 Connacht Warriors. Deal 1 damage to all enemies.',
    imageUrl: '/images/cards/queenmaedhbh.png',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'summon',
        value: 2,
        target: 'self',
        description: 'Summon two 2/2 Connacht Warriors'
      },
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 1,
        target: 'all',
        description: 'Deal 1 damage to all enemy minions'
      }
    ]
  },

  {
    id: 'f_leg_2',
    name: 'Balor of the Evil Eye',
    element: 'fire',
    type: 'minion',
    rarity: 'legendary',
    manaCost: 9,
    attack: 7,
    health: 7,
    description: 'End of Turn: Deal 2 damage to ALL characters.',
    abilities: [
      {
        trigger: 'end_of_turn',
        type: 'damage',
        value: 2,
        target: 'all',
        description: 'Deal 2 damage to all characters (including friendly)'
      }
    ]
  },

  // FIRE EPIC
  {
    id: 'f_epic_1',
    name: 'Scáthach',
    element: 'fire',
    type: 'minion',
    rarity: 'epic',
    manaCost: 6,
    attack: 5,
    health: 4,
    description: 'Battlecry: Give a friendly minion +3 Attack.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'buff',
        value: 3,
        target: 'choose',
        description: 'Give a friendly minion +3 Attack'
      }
    ]
  },

  // WATER LEGENDARY
  {
    id: 'w_leg_1',
    name: 'Fionn mac Cumhaill',
    element: 'water',
    type: 'minion',
    rarity: 'legendary',
    manaCost: 6,
    attack: 5,
    health: 6,
    description: 'Battlecry: Add a Salmon of Knowledge to hand. Your spells cost (1) less.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'summon',
        value: 1,
        target: 'self',
        description: 'Add Salmon of Knowledge to your hand'
      },
      {
        trigger: 'passive',
        type: 'buff',
        value: -1,
        target: 'self',
        description: 'Your spells cost (1) less'
      }
    ]
  },

  // WATER SPELL
  {
    id: 'w_common_1',
    name: 'Salmon of Knowledge',
    element: 'water',
    type: 'spell',
    rarity: 'rare',
    manaCost: 1,
    description: 'Draw 3 cards.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 3,
        target: 'self',
        description: 'Draw 3 cards'
      }
    ]
  },

  // EARTH LEGENDARY
  {
    id: 'e_leg_1',
    name: 'St. Brigid',
    element: 'earth',
    type: 'minion',
    rarity: 'legendary',
    manaCost: 6,
    attack: 4,
    health: 7,
    description: 'Battlecry: Restore 6 Health to your hero. Your healing effects are doubled.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 6,
        target: 'self',
        description: 'Restore 6 Health to your hero'
      },
      {
        trigger: 'passive',
        type: 'buff',
        value: 2,
        target: 'self',
        description: 'Double all healing effects'
      }
    ]
  },

  // EARTH SPELL
  {
    id: 'e_common_1',
    name: "Dagda's Blessing",
    element: 'earth',
    type: 'spell',
    rarity: 'common',
    manaCost: 2,
    description: 'Restore 6 Health.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 6,
        target: 'choose',
        description: 'Restore 6 Health to a character'
      }
    ]
  },

  // AIR LEGENDARY
  {
    id: 'a_leg_1',
    name: 'Lugh Lámhfhada',
    element: 'air',
    type: 'minion',
    rarity: 'legendary',
    manaCost: 6,
    attack: 5,
    health: 5,
    description: 'Battlecry: Add a random card from each element to your hand.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 4,
        target: 'self',
        description: 'Discover cards from each element'
      }
    ]
  },

  // SPIRIT LEGENDARY
  {
    id: 's_leg_1',
    name: 'The Morrígan',
    element: 'spirit',
    type: 'minion',
    rarity: 'legendary',
    manaCost: 7,
    attack: 5,
    health: 6,
    description: 'Battlecry: Destroy a minion. Deathrattle: Summon it for your opponent.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'destroy',
        value: 1,
        target: 'choose',
        description: 'Destroy a minion'
      },
      {
        trigger: 'deathrattle',
        type: 'summon',
        value: 1,
        target: 'enemy',
        description: 'Summon destroyed minion for opponent'
      }
    ]
  },

  // SPIRIT COMMON
  {
    id: 's_common_1',
    name: 'Banshee',
    element: 'spirit',
    type: 'minion',
    rarity: 'common',
    manaCost: 3,
    attack: 2,
    health: 2,
    description: 'Deathrattle: Deal 2 damage to enemy hero.',
    abilities: [
      {
        trigger: 'deathrattle',
        type: 'damage',
        value: 2,
        target: 'enemy',
        description: 'Deal 2 damage to enemy hero'
      }
    ]
  },
  
  // NEUTRAL LEGENDARY
  {
    id: 'n_leg_1',
    name: 'St. Patrick',
    element: 'neutral',
    type: 'minion',
    rarity: 'legendary',
    manaCost: 6,
    attack: 5,
    health: 5,
    description: 'Battlecry: Destroy all Spirit minions. Restore 8 Health to your hero.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'destroy',
        value: 999,
        target: 'all',
        condition: 'spirit_minions_only',
        description: 'Destroy all Spirit minions'
      },
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 8,
        target: 'self',
        description: 'Restore 8 Health to your hero'
      }
    ]
  },
  
  // NEUTRAL SPELL
  {
    id: 'n_common_1',
    name: 'Harvest Festival',
    element: 'neutral',
    type: 'spell',
    rarity: 'common',
    manaCost: 2,
    description: 'Draw 2 cards.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 2,
        target: 'self',
        description: 'Draw 2 cards'
      }
    ]
  },
];