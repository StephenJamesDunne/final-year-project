/**
 * Core game engine logic file. Contains all the pure functions
 * that dictate how the game state changes in response to game events.
 * All of the functions take in state and return new state, meaning they are usable in both the
 * actual browser game and in the Node.js training environment for the AI.
 * 
 * Minion creation + management: createMinion takes a Card
 * and produces a Minion, adding the appropriate fields (see lib/types/game.ts for Card and Minion types).
 * It also handles Charge detection by parsing the card's ability descriptions.
 * enableMinionAttacks is called at the start of each new turn to reset canAttack to true
 * for all minions on a player's board. removeDead filters out minions with currentHealth <= 0.
 * 
 * Combat system: calculateCombatDamage works out post-combat health values
 * and survival flags for both participants. handleMinionCombat wraps that and returns a CombatResult,
 * which describes what happened, including updated minion states and death flags. handleHeroAttack does
 * a simpler version of this, but only for minions attacking the enemy hero directly. 
 * updateBoardAfterCombat is a helper which takes a board and a combat result, and returns the new board
 * with dead minions removed and surviving minions updated.
 * 
 * Taunt system: hasTaunt, getTauntMinions, boardHasTaunt and isValidAttackTarget work together to enforce Taunt rules.
 * They all work by parsing a card for the string 'taunt' instead of checking a dedicated boolean flag.
 * 
 * Turn management: incrementTurn (most complex function here). Handles all the logic for what changes at 
 * the boundaries of a turn; incrementing the turn counter, increasing max mana (capped at 10), drawing a card
 * for both players, applying fatigue damage if either deck is empty, and resetting all minions' canAttack flags.
 * 
 * checkGameOver is just a health check that returns a gameOver flag and a winner 
 */

import { Player } from '../types/game';
import { Card, Minion } from '../types/game';
import { drawCards, addCardsToHand } from './deckManager';

// Minion Creation and Management
export function createMinion(card: Card): Minion {

  // check if Minion summoned has Charge among its abilities
  const hasCharge = card.abilities?.some(
    ability =>
      ability.trigger === 'passive' &&
      ability.description?.toLowerCase().includes('charge')
  );

  return {
    ...card,
    type: 'minion',
    attack: card.attack!,
    health: card.health!,
    currentHealth: card.health!,
    canAttack: hasCharge!, // <-- summoning sickness controlled by whether charge exists in card's text
    instanceId: `${card.id}-${Date.now()}`,
    keywords: hasCharge ? ['charge'] : [],
  };
}

export function enableMinionAttacks(minions: Minion[]): Minion[] {
  return minions.map(m => ({ ...m, canAttack: true }));
}

export function removeDead(minions: Minion[]): Minion[] {
  return minions.filter(m => m.currentHealth > 0);
}

// Combat System Types and Core Logic
export interface CombatResult {
  updatedAttacker: Minion | null;
  updatedTarget: Minion | null;
  attackerDied: boolean;
  targetDied: boolean;
  damageDealt: number;
}

export function calculateCombatDamage(attacker: Minion, target: Minion) {
  return {
    attackerNewHealth: attacker.currentHealth - target.attack,
    targetNewHealth: target.currentHealth - attacker.attack,
    attackerSurvives: attacker.currentHealth > target.attack,
    targetSurvives: target.currentHealth > attacker.attack
  };
}

// handleMinionCombat takes in attacker and target minions, and returns 
export function handleMinionCombat(
  attacker: Minion,
  target: Minion
): CombatResult {
  const combatResult = calculateCombatDamage(attacker, target);

  return {
    updatedAttacker: combatResult.attackerSurvives ? {
      ...attacker,
      currentHealth: combatResult.attackerNewHealth,
      canAttack: false
    } : null,
    updatedTarget: combatResult.targetSurvives ? {
      ...target,
      currentHealth: combatResult.targetNewHealth
    } : null,
    attackerDied: !combatResult.attackerSurvives,
    targetDied: !combatResult.targetSurvives,
    damageDealt: attacker.attack
  };
}

// Parse minion text for Taunt effect.
// Note: have to check for passive triggers here, because some cards might interact with Taunt
// without having it themselves
export function hasTaunt(minion: Minion): boolean {
  if (!minion.abilities) return false;

  return minion.abilities.some(ability => 
    ability.trigger === 'passive' && 
    ability.description?.toLowerCase().includes('taunt')
  );
}

// get all minions with Taunt on the board
export function getTauntMinions(board: Minion[]): Minion[] {
  return board.filter(minion => hasTaunt(minion));
}

// check if there are alive Taunt minions in play
export function boardHasTaunt(board: Minion[]): boolean {
  return board.some(minion => hasTaunt(minion));
}

 // Check if a target is valid considering Taunt rules
 // Returns true if the attack is allowed, false if blocked by Taunt
export function isValidAttackTarget(
  targetId: string | 'face',
  enemyBoard: Minion[]
): boolean {
  // If no Taunt minions, any target is valid
  if (!boardHasTaunt(enemyBoard)) {
    return true;
  }
  
  // If attacking face while Taunt exists, invalid
  if (targetId === 'face') {
    return false;
  }
  
  // If attacking a minion, check if it has Taunt
  const targetMinion = enemyBoard.find(m => m.instanceId === targetId);
  if (!targetMinion) {
    return false;
  }
  
  // Only valid if the target itself has Taunt
  return hasTaunt(targetMinion);
}

export function handleHeroAttack(
  attacker: Minion,
): { damage: number; updatedAttacker: Minion } {
  return {
    damage: attacker.attack,
    updatedAttacker: {
      ...attacker,
      canAttack: false
    }
  };
}

export function updateBoardAfterCombat(
  board: Minion[],
  minionId: string,
  updatedMinion: Minion | null
): Minion[] {
  if (!updatedMinion) {
    return removeDead(board.filter(m => m.instanceId !== minionId));
  }
  return board.map(m => m.instanceId === minionId ? updatedMinion : m);
}

// --- Turn Management -----------------------------------------------------

// called once when a player's turn begins
// Handles everything that should happen at the start of a turn
// Draw a card, increment mana (capped at 10), reset minion attacks, and apply fatigue if needed

// Called twice per round, once for the AI at the start of its turn, and once for the player at the start of theirs
export function startTurn (
  player: Player,
  currentMaxMana: number,
): {
  player: Player;
  newMaxMana: number;
  drewCard: boolean;
  deckWasEmpty: boolean;
} {
  const newMaxMana = Math.min(currentMaxMana + 1, 10);

  const drawResult = drawCards(player.deck, 1);

  let health = player.health;
  let fatigueCounter = player.fatigueCounter || 0;
  const deckWasEmpty = player.deck.length === 0;

  // Apply fatigue damage if deck is empty
  if (drawResult.cardsMissing > 0) {
    fatigueCounter += drawResult.cardsMissing;
    health -= fatigueCounter; // Fatigue damage increases by 1 each time you fail to draw
  }

  const drewCard = drawResult.drawn.length > 0;

  return {
    player: {
      ...player,
      health,
      fatigueCounter,
      mana: newMaxMana,
      maxMana: newMaxMana,
      hand: addCardsToHand(player.hand, drawResult.drawn),
      deck: drawResult.remaining,
      board: enableMinionAttacks(player.board) // reset minion attacks at start of turn
    },
    newMaxMana,
    drewCard,
    deckWasEmpty
  };
}

// Called once per round to advance the turn counter
// Separated from startTurn to the turn number only increments once per full round
// instead of once per player turn
export function incrementTurnNumber(turnNumber: number): number {
  return turnNumber + 1;
}

export function checkGameOver(playerHealth: number, aiHealth: number) {
  return {
    gameOver: playerHealth <= 0 || aiHealth <= 0,
    winner: playerHealth <= 0 ? 'ai' as const : (aiHealth <= 0 ? 'player' as const : undefined)
  };
}