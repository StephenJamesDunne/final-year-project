import { Card } from '../types/game';

export const CARDS: Card[] = [
  // ═════════════════════════════════════════════════════════════
  // FIRE CARDS - AGGRESSIVE ARCHETYPE
  // Theme: Connacht warriors, burning magic, direct damage
  // Strategy: Fast minions, burn spells, face damage
  // ═════════════════════════════════════════════════════════════

  // FIRE LEGENDARY
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
    manaCost: 6,
    attack: 7,
    health: 5,
    description: 'Charge',
    imageUrl: '/images/cards/balor.png',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Can attack immediately (Charge)'
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
    description: 'Battlecry: Deal 2 damage to the enemy hero.',
    imageUrl: '/images/cards/scáthach.png',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 2,
        target: 'enemy',
        description: 'Deal 2 damage to enemy hero'
      }
    ]
  },
  {
    id: 'f_epic_2',
    name: 'Fomorian Pyromaniac',
    element: 'fire',
    type: 'minion',
    rarity: 'epic',
    manaCost: 6,
    attack: 5,
    health: 5,
    description: 'Battlecry: Give all friendly minions +1 Attack.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'buff',
        value: 1,
        target: 'all',
        description: 'Give all friendly minions +1 Attack'
      }
    ]
  },

  // FIRE RARE
  {
    id: 'f_rare_1',
    name: 'Red Branch Knight',
    element: 'fire',
    type: 'minion',
    rarity: 'rare',
    manaCost: 4,
    attack: 4,
    health: 3,
    description: 'Charge',
    imageUrl: '/images/cards/redbranchknight.png',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Can attack immediately (Charge)'
      }
    ]
  },
  {
    id: 'f_rare_2',
    name: 'Cúchulainn\'s Wrath',
    element: 'fire',
    type: 'minion',
    rarity: 'rare',
    manaCost: 5,
    attack: 6,
    health: 2,
    description: 'Charge. Deathrattle: Deal 2 damage to the enemy hero.',
    imageUrl: '/images/cards/cuchulainnswrath.png',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Can attack immediately (Charge)'
      },
      {
        trigger: 'deathrattle',
        type: 'damage',
        value: 3,
        target: 'enemy',
        description: 'Deal 2 damage to enemy hero'
      }
    ]
  },
  {
    id: 'f_rare_3',
    name: 'Flame Imp',
    element: 'fire',
    type: 'minion',
    rarity: 'rare',
    manaCost: 1,
    attack: 3,
    health: 2,
    description: 'Battlecry: Deal 3 damage to your own hero.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 3,
        target: 'self',
        description: 'Deal 3 damage to your own hero'
      }
    ]
  },
  {
    id: 'f_rare_4',
    name: 'Wildfire Spirit',
    element: 'fire',
    type: 'minion',
    rarity: 'rare',
    manaCost: 2,
    attack: 3,
    health: 1,
    description: 'Charge',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Can attack immediately (Charge)'
      }
    ]
  },

  // FIRE COMMON
  {
    id: 'f_common_1',
    name: 'Fianna Scout',
    element: 'fire',
    type: 'minion',
    rarity: 'common',
    manaCost: 1,
    attack: 2,
    health: 1,
    description: 'Fast and fragile.',
    imageUrl: '/images/cards/fiannascout.png'
  },
  {
    id: 'f_common_2',
    name: 'Warrior of Maedhbh',
    element: 'fire',
    type: 'minion',
    rarity: 'common',
    manaCost: 2,
    attack: 3,
    health: 2,
    description: 'Loyal soldier of Queen Maedhbh.',
    imageUrl: ''
  },
  {
    id: 'f_common_3',
    name: 'Connacht Berserker',
    element: 'fire',
    type: 'minion',
    rarity: 'common',
    manaCost: 3,
    attack: 5,
    health: 2,
    description: 'Battlecry: Deal 2 damage to your own hero.',
    imageUrl: '',
  },
  {
    id: 'f_common_4',
    name: 'Ember Sprite',
    element: 'fire',
    type: 'minion',
    rarity: 'common',
    manaCost: 1,
    attack: 1,
    health: 2,
    description: 'Deathrattle: Deal 2 damage to the enemy hero.',
    imageUrl: '',
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
  {
    id: 'f_common_5',
    name: 'Connacht Raider',
    element: 'fire',
    type: 'minion',
    rarity: 'common',
    manaCost: 3,
    attack: 4,
    health: 2,
    description: 'Aggressive raider from the west.',
    imageUrl: ''
  },
  {
    id: 'f_common_6',
    name: 'Furbolg Bruiser',
    element: 'fire',
    type: 'minion',
    rarity: 'common',
    manaCost: 4,
    attack: 5,
    health: 3,
    description: 'A heavy hitter.'
  },
  {
    id: 'f_common_7',
    name: 'Burning Zealot',
    element: 'fire',
    type: 'minion',
    rarity: 'common',
    manaCost: 2,
    attack: 2,
    health: 2,
    description: 'Battlecry: Deal 1 damage to the enemy hero.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 1,
        target: 'enemy',
        description: 'Deal 1 damage to enemy hero'
      }
    ]
  },

  // FIRE SPELLS
  {
    id: 'f_spell_1',
    name: 'Bealtaine Flames',
    element: 'fire',
    type: 'spell',
    rarity: 'common',
    manaCost: 2,
    description: 'Deal 3 damage to the enemy hero.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 3,
        target: 'enemy',
        description: 'Deal 3 damage to enemy hero'
      }
    ]
  },
  {
    id: 'f_spell_2',
    name: 'Fireblast',
    element: 'fire',
    type: 'spell',
    rarity: 'common',
    manaCost: 4,
    description: 'Deal 5 damage to the enemy hero.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 5,
        target: 'enemy',
        description: 'Deal 5 damage to enemy hero'
      }
    ]
  },
  {
    id: 'f_spell_3',
    name: 'Wildfire',
    element: 'fire',
    type: 'spell',
    rarity: 'rare',
    manaCost: 3,
    description: 'Deal 2 damage to a random enemy minion. Deal 2 damage to the enemy hero.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 2,
        target: 'random',
        description: 'Deal 2 damage to random enemy minion'
      },
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 2,
        target: 'enemy',
        description: 'Deal 2 damage to enemy hero'
      }
    ]
  },

  // ═════════════════════════════════════════════════════════════
  // EARTH CARDS - DEFENSIVE ARCHETYPE
  // Theme: Munster endurance, druidic healing, survival
  // Strategy: Taunts, healing, late-game value
  // ═════════════════════════════════════════════════════════════

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
    description: 'Taunt Battlecry: Restore 6 Health to your hero.',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Taunt'
      },
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 6,
        target: 'self',
        description: 'Restore 6 Health to your hero'
      }
    ]
  },
  {
    id: 'e_leg_2',
    name: 'The Dagda',
    element: 'earth',
    type: 'minion',
    rarity: 'legendary',
    manaCost: 7,
    attack: 5,
    health: 8,
    description: 'Taunt. Battlecry: Restore 4 Health to your hero. Draw a card.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Taunt'
      },
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 4,
        target: 'self',
        description: 'Restore 4 Health to your hero'
      },
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 1,
        target: 'self',
        description: 'Draw a card'
      }
    ]
  },

  // EARTH EPIC
  {
    id: 'e_epic_1',
    name: 'Crom Cruach',
    element: 'earth',
    type: 'minion',
    rarity: 'epic',
    manaCost: 8,
    attack: 6,
    health: 10,
    description: 'Taunt.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Taunt'
      }
    ]
  },
  {
    id: 'e_epic_2',
    name: 'Ancient of Life',
    element: 'earth',
    type: 'minion',
    rarity: 'epic',
    manaCost: 6,
    attack: 3,
    health: 8,
    description: 'Taunt. Deathrattle: Restore 5 Health to your hero.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Taunt'
      },
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 5,
        target: 'self',
        description: 'Restore 5 Health to your hero'
      }
    ]
  },

  // EARTH RARE
  {
    id: 'e_rare_1',
    name: 'Dian Cécht',
    element: 'earth',
    type: 'minion',
    rarity: 'rare',
    manaCost: 4,
    attack: 2,
    health: 6,
    description: 'Battlecry: Restore 4 Health to your hero.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 4,
        target: 'self',
        description: 'Restore 4 Health to your hero'
      }
    ]
  },
  {
    id: 'e_rare_2',
    name: 'Ancient Oak',
    element: 'earth',
    type: 'minion',
    rarity: 'rare',
    manaCost: 5,
    attack: 2,
    health: 8,
    description: 'Taunt. Deathrattle: Restore 3 Health to your hero.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Taunt'
      },
      {
        trigger: 'deathrattle',
        type: 'heal',
        value: 3,
        target: 'self',
        description: 'Restore 3 Health to your hero'
      }
    ]
  },
  {
    id: 'e_rare_3',
    name: 'Moss Giant',
    element: 'earth',
    type: 'minion',
    rarity: 'rare',
    manaCost: 6,
    attack: 4,
    health: 8,
    description: 'Taunt.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Taunt,'
      }
    ]
  },
  {
    id: 'e_rare_4',
    name: 'Earthen Protector',
    element: 'earth',
    type: 'minion',
    rarity: 'rare',
    manaCost: 3,
    attack: 2,
    health: 5,
    description: 'Taunt.',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Taunt'
      }
    ]
  },

  // EARTH COMMON
  {
    id: 'e_common_1',
    name: 'Furbolg Defender',
    element: 'earth',
    type: 'minion',
    rarity: 'common',
    manaCost: 3,
    attack: 1,
    health: 6,
    description: 'Sturdy defender of the ancient lands.',
    imageUrl: ''
  },
  {
    id: 'e_common_2',
    name: 'Stone Circle Guardian',
    element: 'earth',
    type: 'minion',
    rarity: 'common',
    manaCost: 2,
    attack: 1,
    health: 4,
    description: 'Taunt.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Taunt'
      }
    ]
  },
  {
    id: 'e_common_3',
    name: 'Grove Tender',
    element: 'earth',
    type: 'minion',
    rarity: 'common',
    manaCost: 1,
    attack: 1,
    health: 3,
    description: 'Battlecry: Restore 2 Health to your hero.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 2,
        target: 'self',
        description: 'Heal 2'
      }
    ]
  },
  {
    id: 'e_common_4',
    name: 'Ironbark Protector',
    element: 'earth',
    type: 'minion',
    rarity: 'common',
    manaCost: 4,
    attack: 2,
    health: 6,
    description: 'Taunt.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Taunt'
      }
    ]
  },
  {
    id: 'e_common_5',
    name: 'Druid Apprentice',
    element: 'earth',
    type: 'minion',
    rarity: 'common',
    manaCost: 2,
    attack: 2,
    health: 3,
    description: 'Young druid learning the ancient ways.',
    imageUrl: ''
  },
  {
    id: 'e_common_6',
    name: 'Rooted Treant',
    element: 'earth',
    type: 'minion',
    rarity: 'common',
    manaCost: 5,
    attack: 3,
    health: 7,
    description: 'Solid and immovable.',
  },
  {
    id: 'e_common_7',
    name: 'Healing Wisp',
    element: 'earth',
    type: 'minion',
    rarity: 'common',
    manaCost: 1,
    attack: 1,
    health: 1,
    description: 'Deathrattle: Restore 2 Health to your hero.',
    abilities: [
      {
        trigger: 'deathrattle',
        type: 'heal',
        value: 2,
        target: 'self',
        description: 'Restore 2 Health to your hero'
      }
    ]
  },

  // EARTH SPELLS
  {
    id: 'e_spell_1',
    name: 'Healing Springs',
    element: 'earth',
    type: 'spell',
    rarity: 'common',
    manaCost: 2,
    description: 'Restore 5 Health to your hero.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 5,
        target: 'self',
        description: 'Restore 5 Health to your hero'
      }
    ]
  },
  {
    id: 'e_spell_2',
    name: 'Bounty of Nature',
    element: 'earth',
    type: 'spell',
    rarity: 'common',
    manaCost: 3,
    description: 'Restore 3 Health to your hero. Draw a card.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 3,
        target: 'self',
        description: 'Restore 3 Health to your hero'
      },
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 1,
        target: 'self',
        description: 'Draw a card'
      }
    ]
  },
  {
    id: 'e_spell_3',
    name: 'Ancient Wisdom',
    element: 'earth',
    type: 'spell',
    rarity: 'rare',
    manaCost: 4,
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

  // ═════════════════════════════════════════════════════════════
  // NEUTRAL CARDS - UNIVERSAL TOOLS
  // Theme: Historical Irish figures, flexible effects
  // Strategy: Fill gaps in any deck archetype
  // ═════════════════════════════════════════════════════════════

  {
    id: 'n_common_1',
    name: 'Battle Ready',
    element: 'neutral',
    type: 'minion',
    rarity: 'common',
    manaCost: 1,
    attack: 1,
    health: 2,
    description: 'A humble beginning.',
  },
  {
    id: 'n_common_2',
    name: 'Celtic Warrior',
    element: 'neutral',
    type: 'minion',
    rarity: 'common',
    manaCost: 2,
    attack: 2,
    health: 3,
    description: 'Reliable fighter.',
  },
  {
    id: 'n_common_3',
    name: 'Village Elder',
    element: 'neutral',
    type: 'minion',
    rarity: 'common',
    manaCost: 3,
    attack: 3,
    health: 3,
    description: 'Battlecry: Draw a card.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 1,
        target: 'self',
        description: 'Draw a card'
      }
    ]
  },
  {
    id: 'n_common_4',
    name: 'Wandering Bard',
    element: 'neutral',
    type: 'minion',
    rarity: 'common',
    manaCost: 4,
    attack: 3,
    health: 5,
    description: 'Tells tales of ancient heroes.',
  },
  {
    id: 'n_rare_1',
    name: 'Brian Boru',
    element: 'neutral',
    type: 'minion',
    rarity: 'rare',
    manaCost: 5,
    attack: 4,
    health: 4,
    description: 'Battlecry: Give all friendly minions +1/+1.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'buff',
        value: 1,
        target: 'all',
        description: 'Give all friendly minions +1/+1'
      }
    ]
  },
  {
    id: 'n_rare_2',
    name: 'High King',
    element: 'neutral',
    type: 'minion',
    rarity: 'rare',
    manaCost: 6,
    attack: 5,
    health: 5,
    description: 'Battlecry: Draw 2 cards.',
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

// ═════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════


// Get all cards for an archetype deck (element + neutral)
export function getArchetypeCards(archetype: 'aggressive' | 'defensive'): Card[] {
  const elementMap = {
    aggressive: 'fire',
    defensive: 'earth',
  };

  const element = elementMap[archetype];
  return CARDS.filter(card => card.element === element || card.element === 'neutral');
}

// Return statistics about the card collection
export const CARD_STATS = {
  total: CARDS.length,
  byElement: {
    fire: CARDS.filter(c => c.element === 'fire').length,
    earth: CARDS.filter(c => c.element === 'earth').length,
    neutral: CARDS.filter(c => c.element === 'neutral').length,
  },
};