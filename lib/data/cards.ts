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
    description: 'Charge. Blazing speed.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Charge'
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
  // WATER CARDS - TEMPO ARCHETYPE
  // Theme: Leinster wisdom, flowing tactics, card advantage
  // Strategy: Efficient minions, card draw, board control
  // ═════════════════════════════════════════════════════════════

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
    imageUrl: '/images/cards/fionnmaccumhaill.png',
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
  {
    id: 'w_leg_2',
    name: 'Manannán mac Lir',
    element: 'water',
    type: 'minion',
    rarity: 'legendary',
    manaCost: 8,
    attack: 6,
    health: 8,
    description: 'Battlecry: Return all enemy minions to their owner\'s hand.',
    imageUrl: '/images/cards/manannan.png',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'return_to_hand',
        value: 999,
        target: 'enemy',
        description: 'Return all enemy minions to hand'
      }
    ]
  },

  // WATER EPIC
  {
    id: 'w_epic_1',
    name: 'Diarmuid Ua Duibhne',
    element: 'water',
    type: 'minion',
    rarity: 'epic',
    manaCost: 5,
    attack: 4,
    health: 4,
    description: 'Battlecry: Your next spell this turn costs (2) less.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'buff',
        value: -2,
        target: 'self',
        description: 'Next spell costs (2) less'
      }
    ]
  },
  {
    id: 'w_epic_2',
    name: 'Merrow Tide Sage',
    element: 'water',
    type: 'minion',
    rarity: 'epic',
    manaCost: 5,
    attack: 3,
    health: 6,
    description: 'Battlecry: Your spells cost (1) less this turn.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'buff',
        value: -1,
        target: 'self',
        description: 'Spells cost 1 less this turn'
      }
    ]
  },

  // WATER RARE
  {
    id: 'w_rare_1',
    name: 'Oisín the Wanderer',
    element: 'water',
    type: 'minion',
    rarity: 'rare',
    manaCost: 3,
    attack: 2,
    health: 3,
    description: 'Battlecry: If Fionn mac Cumhaill is in play, draw 2 cards.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 2,
        target: 'self',
        condition: 'if_fionn_in_play',
        description: 'If Fionn is in play, draw 2 cards'
      }
    ]
  },
  {
    id: 'w_rare_2',
    name: 'The Dagda\'s Cauldron',
    element: 'water',
    type: 'minion',
    rarity: 'rare',
    manaCost: 3,
    attack: 0,
    health: 5,
    description: 'At the end of your turn, add a random Water card to your hand.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'end_of_turn',
        type: 'draw',
        value: 1,
        target: 'self',
        description: 'Add random Water card to hand'
      }
    ]
  },
  {
    id: 'w_rare_3',
    name: 'Selkie Shapeshifter',
    element: 'water',
    type: 'minion',
    rarity: 'rare',
    manaCost: 4,
    attack: 3,
    health: 4,
    description: 'Battlecry: Return a friendly minion to hand. It costs (1) less.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'return_to_hand',
        value: 1,
        target: 'choose',
        description: 'Return minion, reduce cost'
      }
    ]
  },
  {
    id: 'w_rare_4',
    name: 'The Drowned King',
    element: 'water',
    type: 'minion',
    rarity: 'rare',
    manaCost: 7,
    attack: 5,
    health: 7,
    description: 'Battlecry: Draw 2 cards.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 2,
        target: 'self',
        description: 'Draw 2'
      }
    ]
  },

  // WATER COMMON
  {
    id: 'w_common_1',
    name: 'Children of Lir',
    element: 'water',
    type: 'minion',
    rarity: 'common',
    manaCost: 2,
    attack: 1,
    health: 3,
    description: 'Deathrattle: Return this to your hand.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'deathrattle',
        type: 'return_to_hand',
        value: 1,
        target: 'self',
        description: 'Return this minion to your hand'
      }
    ]
  },
  {
    id: 'w_common_2',
    name: 'Leinster Tidecaller',
    element: 'water',
    type: 'minion',
    rarity: 'common',
    manaCost: 2,
    attack: 2,
    health: 3,
    description: 'Solid baseline of stats.',
    imageUrl: ''
  },
  {
    id: 'w_common_3',
    name: 'River Guardian',
    element: 'water',
    type: 'minion',
    rarity: 'common',
    manaCost: 4,
    attack: 3,
    health: 5,
    description: 'Battlecry: Draw a card if you control another Water minion.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 1,
        target: 'self',
        condition: 'if_water_minion_in_play',
        description: 'Draw a card if you have a Water minion'
      }
    ]
  },
  {
    id: 'w_common_4',
    name: 'Leinster Scholar',
    element: 'water',
    type: 'minion',
    rarity: 'common',
    manaCost: 1,
    attack: 1,
    health: 2,
    description: 'Battlecry: Draw a card if you have 5 or more mana.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 1,
        target: 'self',
        condition: 'if_5_mana',
        description: 'Draw if 5+ mana'
      }
    ]
  },
  {
    id: 'w_common_5',
    name: 'Wave Rider',
    element: 'water',
    type: 'minion',
    rarity: 'common',
    manaCost: 3,
    attack: 3,
    health: 3,
    description: 'Balanced stats for tempo plays.',
    imageUrl: ''
  },
  {
    id: 'w_common_6',
    name: 'Tidal Scout',
    element: 'water',
    type: 'minion',
    rarity: 'common',
    manaCost: 2,
    attack: 2,
    health: 2,
    description: 'Battlecry: Look at the top 2 cards of your deck.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 0,
        target: 'self',
        description: 'Scry 2'
      }
    ]
  },

  // WATER SPELLS
  {
    id: 'w_spell_1',
    name: 'Salmon of Knowledge',
    element: 'water',
    type: 'spell',
    rarity: 'rare',
    manaCost: 1,
    description: 'Draw 3 cards.',
    imageUrl: '/images/cards/salmonofknowledge.png',
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
  {
    id: 'w_spell_2',
    name: 'Tidal Wave',
    element: 'water',
    type: 'spell',
    rarity: 'rare',
    manaCost: 4,
    description: 'Return a minion to its owner\'s hand. Draw a card.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'return_to_hand',
        value: 1,
        target: 'choose',
        description: 'Return target minion to hand'
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
    id: 'w_spell_3',
    name: 'Riptide',
    element: 'water',
    type: 'spell',
    rarity: 'common',
    manaCost: 1,
    description: 'Draw a card.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 1,
        target: 'self',
        description: 'Draw 1'
      }
    ]
  },
  {
    id: 'w_spell_4',
    name: 'Cascade',
    element: 'water',
    type: 'spell',
    rarity: 'rare',
    manaCost: 3,
    description: 'Deal 1 damage. Draw a card. Repeat twice.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 1,
        target: 'choose',
        description: 'Deal 1, draw 1, repeat'
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
  // AIR CARDS - BALANCED ARCHETYPE
  // Theme: Ulster cunning, fairy tricks, flexibility
  // Strategy: Adaptive answers, disruption, value trades
  // ═════════════════════════════════════════════════════════════

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

  // AIR EPIC
  {
    id: 'a_epic_1',
    name: 'Banshee Queen',
    element: 'air',
    type: 'minion',
    rarity: 'epic',
    manaCost: 6,
    attack: 4,
    health: 5,
    description: 'Battlecry: Silence all enemy minions.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'buff',
        value: 0,
        target: 'enemy',
        description: 'Silence all enemy minions (remove abilities)'
      }
    ]
  },
  {
    id: 'a_epic_2',
    name: 'Sylph Queen',
    element: 'air',
    type: 'minion',
    rarity: 'epic',
    manaCost: 6,
    attack: 5,
    health: 5,
    description: 'Your spells have +1 Spell Damage.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 1,
        target: 'self',
        description: '+1 Spell Damage'
      }
    ]
  },

  // AIR RARE
  {
    id: 'a_rare_1',
    name: 'Púca Trickster',
    element: 'air',
    type: 'minion',
    rarity: 'rare',
    manaCost: 3,
    attack: 2,
    health: 2,
    description: 'Battlecry: Transform a random enemy minion into a 1/1 Sheep.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'transform',
        value: 1,
        target: 'random',
        description: 'Transform random enemy into 1/1 Sheep'
      }
    ]
  },
  {
    id: 'a_rare_2',
    name: 'Changeling',
    element: 'air',
    type: 'minion',
    rarity: 'rare',
    manaCost: 4,
    attack: 3,
    health: 3,
    description: 'Battlecry: Copy the Deathrattle of a friendly minion.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'buff',
        value: 0,
        target: 'choose',
        description: 'Copy Deathrattle from friendly minion'
      }
    ]
  },
  {
    id: 'a_rare_3',
    name: 'Storm Elemental',
    element: 'air',
    type: 'minion',
    rarity: 'rare',
    manaCost: 5,
    attack: 4,
    health: 4,
    description: 'Battlecry: Return an enemy minion to hand.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'return_to_hand',
        value: 1,
        target: 'enemy',
        description: 'Bounce enemy'
      }
    ]
  },

  // AIR COMMON
  {
    id: 'a_common_1',
    name: 'Aos Sí Scout',
    element: 'air',
    type: 'minion',
    rarity: 'common',
    manaCost: 2,
    attack: 3,
    health: 1,
    description: 'Swift fairy scout.',
    imageUrl: ''
  },
  {
    id: 'a_common_2',
    name: 'Sidhe Mystic',
    element: 'air',
    type: 'minion',
    rarity: 'common',
    manaCost: 3,
    attack: 2,
    health: 4,
    description: 'Battlecry: Discover a spell from any element.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 1,
        target: 'self',
        description: 'Discover a spell'
      }
    ]
  },
  {
    id: 'a_common_3',
    name: 'Will-o\'-the-Wisp',
    element: 'air',
    type: 'minion',
    rarity: 'common',
    manaCost: 1,
    attack: 1,
    health: 1,
    description: 'Battlecry: Your next spell costs (1) less.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'buff',
        value: -1,
        target: 'self',
        description: 'Next spell costs (1) less'
      }
    ]
  },
  {
    id: 'a_common_4',
    name: 'Faerie Dragon',
    element: 'air',
    type: 'minion',
    rarity: 'common',
    manaCost: 2,
    attack: 3,
    health: 2,
    description: 'Cannot be targeted by spells or abilities.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'passive',
        type: 'buff',
        value: 0,
        target: 'self',
        description: 'Spell immunity'
      }
    ]
  },
  {
    id: 'a_common_5',
    name: 'Wind Dancer',
    element: 'air',
    type: 'minion',
    rarity: 'common',
    manaCost: 3,
    attack: 3,
    health: 3,
    description: 'Graceful and balanced.',
    imageUrl: ''
  },
  {
    id: 'a_common_6',
    name: 'Pixie',
    element: 'air',
    type: 'minion',
    rarity: 'common',
    manaCost: 1,
    attack: 1,
    health: 1,
    description: 'Battlecry: Add a random Air spell to hand.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 1,
        target: 'self',
        description: 'Add random Air spell'
      }
    ]
  },

  // AIR SPELLS
  {
    id: 'a_spell_1',
    name: 'Leprechaun\'s Gold',
    element: 'air',
    type: 'spell',
    rarity: 'common',
    manaCost: 1,
    description: 'Gain +1 mana this turn only.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'gain_mana',
        value: 1,
        target: 'self',
        description: 'Gain +1 mana this turn'
      }
    ]
  },
  {
    id: 'a_spell_2',
    name: 'Mannanán\'s Mist',
    element: 'air',
    type: 'spell',
    rarity: 'common',
    manaCost: 2,
    description: 'Give a minion -2 Attack until end of turn. Draw a card if it dies.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'buff',
        value: -2,
        target: 'choose',
        description: 'Give -2 Attack this turn'
      },
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 1,
        target: 'self',
        condition: 'if_target_dies',
        description: 'Draw if target dies'
      }
    ]
  },
  {
    id: 'a_spell_3',
    name: 'Fairy Ring',
    element: 'air',
    type: 'spell',
    rarity: 'rare',
    manaCost: 3,
    description: 'Swap a minion\'s Attack and Health.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'transform',
        value: 0,
        target: 'choose',
        description: 'Swap Attack and Health'
      }
    ]
  },
  {
    id: 'a_spell_4',
    name: 'Gust',
    element: 'air',
    type: 'spell',
    rarity: 'common',
    manaCost: 2,
    description: 'Deal 1 damage. Draw a card.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 1,
        target: 'choose',
        description: 'Deal 1, draw 1'
      }
    ]
  },
  {
    id: 'a_spell_5',
    name: 'Windstorm',
    element: 'air',
    type: 'spell',
    rarity: 'rare',
    manaCost: 5,
    description: 'Return all minions to their owners\' hands.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'return_to_hand',
        value: 999,
        target: 'all',
        description: 'Bounce all minions'
      }
    ]
  },
  {
    id: 'a_spell_6',
    name: 'Cloudburst',
    element: 'air',
    type: 'spell',
    rarity: 'rare',
    manaCost: 4,
    description: 'Silence an enemy minion. Draw a card.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'buff',
        value: 0,
        target: 'enemy',
        description: 'Silence, draw 1'
      }
    ]
  },

  // ═════════════════════════════════════════════════════════════
  // SPIRIT CARDS - WILD CARD ARCHETYPE
  // Theme: Death, resurrection, chaos, high-risk plays
  // Strategy: Flexible tools for any deck archetype
  // ═════════════════════════════════════════════════════════════

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

  // SPIRIT RARE
  {
    id: 's_rare_1',
    name: 'Dullahan',
    element: 'spirit',
    type: 'minion',
    rarity: 'rare',
    manaCost: 5,
    attack: 5,
    health: 3,
    description: 'Battlecry: Deal 2 damage to the enemy hero.',
    imageUrl: '',
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

  // SPIRIT COMMON
  {
    id: 's_common_1',
    name: 'Cat Sìth',
    element: 'spirit',
    type: 'minion',
    rarity: 'common',
    manaCost: 2,
    attack: 2,
    health: 1,
    description: 'Deathrattle: Summon a 1/1 copy of an enemy minion that died this turn.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'deathrattle',
        type: 'summon',
        value: 1,
        target: 'self',
        description: 'Summon copy of enemy minion that died'
      }
    ]
  },
  {
    id: 's_common_2',
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
  {
    id: 's_common_3',
    name: 'Lost Soul',
    element: 'spirit',
    type: 'minion',
    rarity: 'common',
    manaCost: 1,
    attack: 1,
    health: 1,
    description: 'Deathrattle: Deal 1 damage to a random enemy.',
    imageUrl: '',
    abilities: [
      {
        trigger: 'deathrattle',
        type: 'damage',
        value: 1,
        target: 'random',
        description: 'Deal 1 damage randomly'
      }
    ]
  },

  // SPIRIT SPELLS
  {
    id: 's_spell_1',
    name: 'Banshee Wail',
    element: 'spirit',
    type: 'spell',
    rarity: 'rare',
    manaCost: 4,
    description: 'Deal 1 damage to all enemy minions. If any die, deal 2 damage to enemy hero.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'damage',
        value: 1,
        target: 'enemy',
        description: 'Deal 1 damage to all enemies, bonus if kills'
      }
    ]
  },
  {
    id: 's_spell_2',
    name: 'Reaper\'s Harvest',
    element: 'spirit',
    type: 'spell',
    rarity: 'rare',
    manaCost: 5,
    description: 'Destroy a minion. If it was your own, draw 2 cards.',
    abilities: [
      {
        trigger: 'battlecry',
        type: 'destroy',
        value: 1,
        target: 'choose',
        description: 'Destroy a minion'
      },
      {
        trigger: 'battlecry',
        type: 'draw',
        value: 2,
        target: 'self',
        condition: 'if_friendly_target',
        description: 'Draw 2 if you destroyed your own'
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
export function getArchetypeCards(archetype: 'aggressive' | 'tempo' | 'defensive' | 'balanced'): Card[] {
  const elementMap = {
    aggressive: 'fire',
    tempo: 'water',
    defensive: 'earth',
    balanced: 'air'
  };

  const element = elementMap[archetype];
  return CARDS.filter(card => card.element === element || card.element === 'neutral');
}

// Return statistics about the card collection
export const CARD_STATS = {
  total: CARDS.length,
  byElement: {
    fire: CARDS.filter(c => c.element === 'fire').length,
    water: CARDS.filter(c => c.element === 'water').length,
    earth: CARDS.filter(c => c.element === 'earth').length,
    air: CARDS.filter(c => c.element === 'air').length,
    spirit: CARDS.filter(c => c.element === 'spirit').length,
    neutral: CARDS.filter(c => c.element === 'neutral').length,
  },
};