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

  // FIRE ADDITIONS
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
    id: 'f_common_1',
    name: 'Connacht Warrior',
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
    id: 'f_spell_1',
    name: 'Beltane Flames',
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

  // WATER ADDITIONS
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
    imageUrl: '',
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
    id: 'w_common_2',
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

  // EARTH ADDITIONS
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
    id: 'e_common_2',
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

  // AIR ADDITIONS
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

  // SPIRIT ADDITIONS
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

  {
    id: 's_common_2',
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

  // NEUTRAL ADDITIONS
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

  {
    id: 'n_common_2',
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
  }
];