// For game constants

import { Element, CardType, Rarity} from '@/lib/types/game';

export const BOARD_DIMENSIONS = {
  width: 1400,
  height: 900,
};

// Element styling constants
export const ELEMENT_COLORS = {
  fire: 'from-red-600 to-orange-600',
  water: 'from-blue-600 to-cyan-600',
  earth: 'from-green-600 to-emerald-600',
  air: 'from-purple-600 to-pink-600',
  spirit: 'from-indigo-600 to-violet-600',
  neutral: 'from-gray-600 to-slate-600',
} as const;

export const ELEMENT_BORDERS = {
  fire: 'border-red-500',
  water: 'border-blue-500',
  earth: 'border-green-500',
  air: 'border-purple-500',
  spirit: 'border-indigo-500',
  neutral: 'border-gray-500',
} as const;

export const ELEMENT_ICONS: Record<Element, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🌿',
  air: '💨',
  spirit: '👻',
  neutral: '⚪',
} as const;

// Rarity styling constants
export const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
} as const;

export const RARITY_BORDERS = {
  common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
} as const;

// Animation constants
export const CARD_ANIMATIONS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

// General Game constants
export const GAME_CONSTANTS = {
  MAX_HAND_SIZE: 10,
  STARTING_HEALTH: 30,
  STARTING_MANA: 1,
  MAX_MANA: 10,
  CARDS_DRAWN_PER_TURN: 1,
  INITIAL_HAND_SIZE: 4,
} as const;

// Card sizing constants
export const CARD_SIZES = {
  compact: {
    width: 'w-24',
    height: 'h-32',
    manaSize: 'w-6 h-6',
    statSize: 'w-5 h-5',
    textSize: 'text-xs',
    artHeight: 'h-16',
    artPosition: 'top-4 left-1 right-1',
  },
  normal: {
    width: 'w-40',
    height: 'h-56',
    manaSize: 'w-10 h-10',
    statSize: 'w-10 h-10',
    textSize: 'text-xl',
    artHeight: 'h-32',
    artPosition: 'top-8 left-2 right-2',
  },
} as const;

// Keywords for card descriptions
export const KEYWORDS = [
  'Battlecry', 'Deathrattle', 'End of Turn', 'Start of Turn', 'Passive',
  'Summon', 'Deal', 'Restore', 'Draw', 'Destroy', 'Give', 'Add', 'Choose',
  'Discover', 'Double', 'Random', 'Friendly', 'Enemy', 'All', 'Attack', 'Health'
] as const;

export const KEYWORD_DEFINITIONS: Record<string, string> = {
  'Battlecry': 'Does something when you play it from your hand.',
  'Deathrattle': 'Does something when it dies.',
  'Taunt': 'Enemies must attack this minion.',
  'Rush': 'Can attack minions immediately.',
  'Charge': 'Can attack immediately.',
  'Divine Shield': 'The first time this takes damage, ignore it.',
  'Windfury': 'Can attack twice each turn.',
  'Stealth': 'Can\'t be attacked until it attacks.',
  'Lifesteal': 'Damage dealt by this heals your hero.',
  'Poisonous': 'Destroy any minion damaged by this.',
  'Freeze': 'Frozen characters lose their next attack.',
  'Silence': 'Remove all card text and enchantments.',
  'End of Turn': 'Triggers at the end of your turn.',
  'Start of Turn': 'Triggers at the start of your turn.',
  'Passive': 'Always active while this minion is alive.'
} as const;