// Core gameplay constants

export const GAME_CONSTANTS = {
  // Maximum cards in hand before burning draws
  MAX_HAND_SIZE: 10,
  
  // Starting health for both players
  STARTING_HEALTH: 30,
  
  // Starting mana on turn 1
  STARTING_MANA: 1,
  
  //Maximum mana cap (reached on turn 10)
  MAX_MANA: 10,
  
  // Maximum minions on board per player
  MAX_BOARD_SIZE: 7,
  
  // Cards drawn per turn (after initial hand)
  CARDS_DRAWN_PER_TURN: 1,
  
  // Cards in starting hand
  INITIAL_HAND_SIZE: 4,
} as const;

// Card mechanics
export const ABILITY_TRIGGERS = [
  'battlecry',      // when played from the hand
  'deathrattle',    // when minion dies
  'end_of_turn',    // at end of turn
  'start_of_turn',  // at start of turn
  'passive'         // always active
] as const;

// What abilities do when they trigger
export const ABILITY_TYPES = [
  'damage',         // Deal damage
  'heal',           // Restore health
  'draw',           // Draw cards
  'buff',           // Increase stats on the board
  'summon',         // Create minions
] as const;

// Who/what is affected by the triggered ability
export const ABILITY_TARGETS = [
  'self',           // Friendly hero
  'enemy',          // Enemy hero
  'all',            // All minions
  'random',         // Random minion
  'choose',         // Player chooses target
] as const;

// Keywords: Special rules text that appears on the cards
// Used for parsing and validation
export const KEYWORDS = [
  'Taunt',          // Must be attacked first
  'Charge',         // Can attack immediately
  'Battlecry',      // Effect triggered when minion is played
  'Deathrattle',    // Effect triggered when minion dies
] as const;

// Type Exports
export type AbilityTrigger = typeof ABILITY_TRIGGERS[number];
export type AbilityType = typeof ABILITY_TYPES[number];
export type AbilityTarget = typeof ABILITY_TARGETS[number];
export type Keyword = typeof KEYWORDS[number];