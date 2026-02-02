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
    manaCost: 7,
    attack: 6,
    health: 5,
    description: 'End of Turn: Deal 2 damage to ALL characters.',
    imageUrl: '/images/cards/balor.png',
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
    imageUrl: '/images/cards/scáthach.png',
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
  {
    id: 'f_epic_2',
    name: 'Fomorian Pyromaniac',
    element: 'fire',
    type: 'minion',
    rarity: 'epic',
    manaCost: 5,
    attack: 4,
    health: 4,
    description: 'Whenever you deal damage to the enemy hero, draw a card.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'draw',
        value: 1,
        target: 'self',
        description: 'Draw when damaging enemy hero'
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
    description: 'Elite warrior of Ulster.',
    imageUrl: '/images/cards/redbranchknight.png'
  },
  {
    id: 'f_rare_2',
    name: 'Cúchulainn\'s Wrath',
    element: 'fire',
    type: 'minion',
    rarity: 'rare',
    manaCost: 5,
    attack: 6,
    health: 3,
    description: 'Charge. Deathrattle: Deal 3 damage to the enemy hero.',
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
        description: 'Deal 3 damage to enemy hero'
      }
    ]
  },
  {
    id: 'f_rare_3',
    name: 'Flame Imp of the Otherworld',
    element: 'fire',
    type: 'minion',
    rarity: 'rare',
    manaCost: 4,
    attack: 5,
    health: 3,
    description: 'Battlecry: Deal 2 damage to your hero and 2 damage to enemy hero.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 2,
        target: 'self',
        description: 'Deal 2 to your hero'
      },
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 2,
        target: 'enemy',
        description: 'Deal 2 to enemy hero'
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
    description: 'Fast and fragile - strike first.',
    imageUrl: '/images/cards/fiannascout.png'
  },
  {
    id: 'f_common_2',
    name: 'Warrior of Maedhbh',
    element: 'fire',
    type: 'minion',
    rarity: 'common',
    manaCost: 2,
    attack: 2,
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
    attack: 4,
    health: 2,
    description: 'Battlecry: Deal 2 damage to your own hero.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 2,
        target: 'self',
        description: 'Deal 2 damage to your own hero'
      }
    ]
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
    description: 'Deathrattle: Deal 1 damage to a random enemy.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'deathrattle',
        type: 'damage',
        value: 1,
        target: 'random',
        description: 'Deal 1 damage to random enemy'
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
    attack: 3,
    health: 3,
    description: 'Aggressive raider from the western province.',
    imageUrl: ''
  },

  // FIRE SPELLS
  {
    id: 'f_spell_1',
    name: 'Bealtaine Flames',
    element: 'fire',
    type: 'spell',
    rarity: 'common',
    manaCost: 3,
    description: 'Deal 3 damage to an enemy.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 3,
        target: 'choose',
        description: 'Deal 3 damage to an enemy'
      }
    ]
  },
  {
    id: 'f_spell_2',
    name: 'Inferno',
    element: 'fire',
    type: 'spell',
    rarity: 'epic',
    manaCost: 4,
    description: 'Deal 2 damage to all enemies.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 2,
        target: 'all',
        description: 'Deal 2 damage to all enemy minions and hero'
      }
    ]
  },
  {
    id: 'f_spell_3',
    name: 'Rage of the Táin',
    element: 'fire',
    type: 'spell',
    rarity: 'rare',
    manaCost: 5,
    description: 'Deal 4 damage. If your hero has 15 or less Health, deal 6 instead.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 4,
        target: 'choose',
        condition: 'enrage_bonus',
        description: 'Deal 4 damage (6 if low health)'
      }
    ]
  },
  {
    id: 'f_spell_4',
    name: 'Molten Strike',
    element: 'fire',
    type: 'spell',
    rarity: 'common',
    manaCost: 2,
    description: 'Deal 2 damage.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 2,
        target: 'choose',
        description: 'Deal 2 damage'
      }
    ]
  },
  {
    id: 'f_spell_5',
    name: 'Scorched Earth',
    element: 'fire',
    type: 'spell',
    rarity: 'rare',
    manaCost: 5,
    description: 'Deal 3 damage to all minions.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 3,
        target: 'all',
        description: 'Deal 3 to all minions'
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
  {
    id: 'e_leg_2',
    name: 'The Dagda',
    element: 'earth',
    type: 'minion',
    rarity: 'legendary',
    manaCost: 5,
    attack: 4,
    health: 5,
    description: 'Battlecry: Gain +2 maximum mana this game.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'gain_mana',
        value: 2,
        target: 'self',
        description: 'Gain +2 maximum mana permanently'
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
    attack: 8,
    health: 8,
    description: 'Taunt. Costs (1) less for each time you restored Health this game.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Taunt. Cost reduction based on healing'
      }
    ]
  },
  {
    id: 'e_epic_2',
    name: 'Ancient of Life',
    element: 'earth',
    type: 'minion',
    rarity: 'epic',
    manaCost: 7,
    attack: 4,
    health: 10,
    description: 'Taunt. Battlecry: Restore 5 Health to all friendly characters.',
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
        target: 'all',
        description: 'Heal all friendlies'
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
    description: 'End of Turn: Restore 2 Health to your hero.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'end_of_turn',
        type: 'heal',
        value: 2,
        target: 'self',
        description: 'Restore 2 Health to your hero'
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
        trigger: 'deathrattle',
        type: 'heal',
        value: 5,
        target: 'self',
        description: 'Restore 5 Health to your hero'
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
    attack: 5,
    health: 8,
    description: 'Taunt. Costs (1) less for each healing effect this game.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Taunt, cost reduction'
      }
    ]
  },

  // EARTH COMMON
  {
    id: 'e_common_1',
    name: 'Fir Bolg Defender',
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
    attack: 0,
    health: 5,
    description: 'Taunt. Cannot attack.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Taunt (enemies must attack this first)'
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
    attack: 3,
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

  // EARTH SPELLS
  {
    id: 'e_spell_1',
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
  {
    id: 'e_spell_2',
    name: 'Forest\'s Wrath',
    element: 'earth',
    type: 'spell',
    rarity: 'rare',
    manaCost: 6,
    description: 'Destroy all minions with 3 or less Health. Restore 3 Health to your hero.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'destroy',
        value: 999,
        target: 'all',
        condition: 'low_health_minions',
        description: 'Destroy minions with 3 or less Health'
      },
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 3,
        target: 'self',
        description: 'Restore 3 Health to your hero'
      }
    ]
  },
  {
    id: 'e_spell_3',
    name: 'Healing Springs',
    element: 'earth',
    type: 'spell',
    rarity: 'common',
    manaCost: 1,
    description: 'Restore 3 Health.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 3,
        target: 'choose',
        description: 'Restore 3 Health'
      }
    ]
  },
  {
    id: 'e_spell_4',
    name: 'Rejuvenation',
    element: 'earth',
    type: 'spell',
    rarity: 'common',
    manaCost: 3,
    description: 'Restore 5 Health. Draw a card.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'heal',
        value: 5,
        target: 'choose',
        description: 'Heal 5, draw 1'
      }
    ]
  },
  {
    id: 'e_spell_5',
    name: 'Entangling Roots',
    element: 'earth',
    type: 'spell',
    rarity: 'rare',
    manaCost: 4,
    description: 'Destroy a minion with 2 or less Attack.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'destroy',
        value: 1,
        target: 'choose',
        condition: 'low_attack',
        description: 'Destroy low attack minion'
      }
    ]
  },
  {
    id: 'e_spell_6',
    name: 'Wild Growth',
    element: 'earth',
    type: 'spell',
    rarity: 'rare',
    manaCost: 3,
    description: 'Gain +1 maximum mana.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'gain_mana',
        value: 1,
        target: 'self',
        description: 'Permanent mana'
      }
    ]
  },

  // ═════════════════════════════════════════════════════════════
  // NEUTRAL CARDS - UNIVERSAL TOOLS
  // Theme: Historical Irish figures, flexible effects
  // Strategy: Fill gaps in any deck archetype
  // ═════════════════════════════════════════════════════════════

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
    description: 'Battlecry: Destroy all minions. Restore 8 Health to your hero.',
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

  // NEUTRAL EPIC
  {
    id: 'n_epic_1',
    name: 'Cú Chulainn',
    element: 'neutral',
    type: 'minion',
    rarity: 'epic',
    manaCost: 4,
    attack: 5,
    health: 2,
    description: 'When this attacks, deal 1 damage to all enemies.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'when_attack',
        type: 'damage',
        value: 1,
        target: 'enemy',
        description: 'Deal 1 damage to all enemies when attacking'
      }
    ]
  },

  // NEUTRAL RARE
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
    imageUrl: '',
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

  // NEUTRAL COMMON
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
  }
];

// ═════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════


// Get all cards for an archetype deck (element + neutral)
export function getArchetypeCards(archetype: 'aggressive'| 'defensive'): Card[] {
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