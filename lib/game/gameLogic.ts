import { BattleState, Card, Minion } from '../types/game';

export function createMinion(card: Card): Minion {
  return {
    ...card,
    type: 'minion',
    attack: card.attack!,
    health: card.health!,
    currentHealth: card.health!,
    canAttack: false,
    instanceId: `${card.id}-${Date.now()}`,
  };
}

export function checkGameOver(playerHealth: number, aiHealth: number) {
  return {
    gameOver: playerHealth <= 0 || aiHealth <= 0,
    winner: playerHealth <= 0 ? 'ai' as const : (aiHealth <= 0 ? 'player' as const : undefined)
  };
}

export function calculateCombatDamage(attacker: Minion, target: Minion) {
  return {
    attackerNewHealth: attacker.currentHealth - target.attack,
    targetNewHealth: target.currentHealth - attacker.attack,
    attackerSurvives: attacker.currentHealth > target.attack,
    targetSurvives: target.currentHealth > attacker.attack
  };
}

export function updateMinionHealth(minion: Minion, newHealth: number): Minion {
  return {
    ...minion,
    currentHealth: newHealth,
    canAttack: false // Minion has attacked this turn
  };
}

export function enableMinionAttacks(minions: Minion[]): Minion[] {
  return minions.map(m => ({ ...m, canAttack: true }));
}

export function disableMinionAttack(minions: Minion[], minionId: string): Minion[] {
  return minions.map(m => 
    m.instanceId === minionId ? { ...m, canAttack: false } : m
  );
}

export function removeDead(minions: Minion[]): Minion[] {
  return minions.filter(m => m.currentHealth > 0);
}

export function incrementTurn(currentTurn: number, maxMana: number = 10): { turnNumber: number, newMaxMana: number } {
  return {
    turnNumber: currentTurn + 1,
    newMaxMana: Math.min(maxMana + 1, 10)
  };
}