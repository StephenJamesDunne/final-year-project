import { BattleState, Player, Minion } from '../types/game';
import { createMinion } from './gameLogic';
import { processAbilities } from './abilitySystem';
import { findPlayableCard, removeCardFromHand } from './deckManager';

export interface AIAction {
  type: 'play_card' | 'attack' | 'pass';
  cardIndex?: number;
  attackerId?: string;
  targetId?: string;
}

export interface AITurnResult {
  newState: BattleState;
  logMessages: string[];
  actions: string[];
}

export function getAIAction(aiState: Player, gameState: BattleState): AIAction {
  // Priority 1: Try to play a card
  const playableCardIndex = findPlayableCard(aiState.hand, aiState.mana);
  
  if (playableCardIndex !== -1) {
    return {
      type: 'play_card',
      cardIndex: playableCardIndex
    };
  }

  // Priority 2: Try to attack with minions
  const attackingMinions = aiState.board.filter(m => m.canAttack);
  if (attackingMinions.length > 0) {
    return {
      type: 'attack',
      attackerId: attackingMinions[0].instanceId,
      targetId: 'face' // Simple AI always goes face
    };
  }

  // Priority 3: Pass turn
  return { type: 'pass' };
}

export function executeAIPlayCard(
  cardIndex: number,
  gameState: BattleState
): { newState: BattleState; logMessage: string; actionMessage: string } {
  const playableCard = gameState.ai.hand[cardIndex];
  let newState = { ...gameState };
  
  // Remove card from hand and reduce mana
  newState.ai = {
    ...newState.ai,
    hand: removeCardFromHand(newState.ai.hand, cardIndex),
    mana: newState.ai.mana - playableCard.manaCost,
  };

  if (playableCard.type === 'minion') {
    const minion = createMinion(playableCard);
    newState.ai.board = [...newState.ai.board, minion];
  }

  // Process battlecry abilities
  newState = processAbilities(playableCard, 'battlecry', newState, false);

  const actionMessage = `Playing ${playableCard.name}...`;
  const logMessage = `Enemy plays ${playableCard.name} (${playableCard.manaCost} mana)`;

  return {
    newState,
    logMessage,
    actionMessage
  };
}

export function executeAIAttacks(gameState: BattleState): { 
  newState: BattleState; 
  logMessages: string[];
  totalDamage: number;
} {
  let newState = { ...gameState };
  const attackingMinions = newState.ai.board.filter(m => m.canAttack);
  let totalDamage = 0;
  let logMessages: string[] = [];

  if (attackingMinions.length > 0) {
    logMessages.push(`Enemy attacks with ${attackingMinions.length} minion(s)`);

    attackingMinions.forEach(minion => {
      newState.player.health -= minion.attack;
      totalDamage += minion.attack;
    });

    if (totalDamage > 0) {
      logMessages.push(`Enemy deals ${totalDamage} damage to you`);
    }

    // Mark minions as having attacked
    newState.ai.board = newState.ai.board.map(m => 
      attackingMinions.some(attacker => attacker.instanceId === m.instanceId)
        ? { ...m, canAttack: false }
        : m
    );
  }

  return { newState, logMessages, totalDamage };
}

export function getAIDecisionDelay(): number {
  // Random delay between 500-1200ms to simulate thinking
  return Math.random() * 700 + 500;
}

export function shouldAIPlayAggressively(gameState: BattleState): boolean {
  // Simple heuristic: play aggressively if player has low health
  return gameState.player.health <= 10;
}

export function evaluateBoardState(gameState: BattleState): {
  playerAdvantage: number;
  aiAdvantage: number;
  recommendation: 'aggressive' | 'defensive' | 'neutral';
} {
  const playerBoardValue = gameState.player.board.reduce((total, minion) => 
    total + minion.attack + minion.currentHealth, 0
  );
  
  const aiBoardValue = gameState.ai.board.reduce((total, minion) => 
    total + minion.attack + minion.currentHealth, 0
  );

  const playerAdvantage = playerBoardValue + gameState.player.health;
  const aiAdvantage = aiBoardValue + gameState.ai.health;

  let recommendation: 'aggressive' | 'defensive' | 'neutral' = 'neutral';
  
  if (aiAdvantage > playerAdvantage * 1.2) {
    recommendation = 'aggressive';
  } else if (playerAdvantage > aiAdvantage * 1.2) {
    recommendation = 'defensive';
  }

  return { playerAdvantage, aiAdvantage, recommendation };
}