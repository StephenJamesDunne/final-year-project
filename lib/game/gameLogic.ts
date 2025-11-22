import { Card, Minion } from '../types/game';

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

export function handleHeroAttack(
  attacker: Minion,
  currentHealth: number
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

// Game State Management
export function incrementTurn(currentTurn: number, maxMana: number = 10): { turnNumber: number, newMaxMana: number } {
  return {
    turnNumber: currentTurn + 1,
    newMaxMana: Math.min(maxMana + 1, 10)
  };
}

export function checkGameOver(playerHealth: number, aiHealth: number) {
  return {
    gameOver: playerHealth <= 0 || aiHealth <= 0,
    winner: playerHealth <= 0 ? 'ai' as const : (aiHealth <= 0 ? 'player' as const : undefined)
  };
}