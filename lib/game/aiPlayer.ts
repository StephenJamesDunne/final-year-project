import { BattleState, Player, Card } from '../types/game';
import { createMinion, getTauntMinions, handleMinionCombat, updateBoardAfterCombat } from './gameLogic';
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
    // Check for Taunt minions on player's board
    const playerTauntMinions = getTauntMinions(gameState.player.board);
    
    if (playerTauntMinions.length > 0) {
      // Must attack a Taunt minion
      return {
        type: 'attack',
        attackerId: attackingMinions[0].instanceId,
        targetId: playerTauntMinions[0].instanceId // Attack first Taunt minion
      };
    }
    
    // No Taunt, go face
    return {
      type: 'attack',
      attackerId: attackingMinions[0].instanceId,
      targetId: 'face'
    };
  }

  // Priority 3: Pass turn
  return { type: 'pass' };
}

export function executeAIPlayCard(
  cardIndex: number,
  gameState: BattleState
): { newState: BattleState; logMessage: string; actionMessage: string; playedCard: Card } {
  const playedCard = { ...gameState.ai.hand[cardIndex] };
  let newState = { ...gameState };
  
  // Remove card from hand and reduce mana
  newState.ai = {
    ...newState.ai,
    hand: removeCardFromHand(newState.ai.hand, cardIndex),
    mana: newState.ai.mana - playedCard.manaCost,
  };

  if (playedCard.type === 'minion') {
    const minion = createMinion(playedCard);
    newState.ai.board = [...newState.ai.board, minion];
  }

  // Process battlecry abilities
  newState = processAbilities(playedCard, 'battlecry', newState, false);

  const actionMessage = `Playing ${playedCard.name}...`;
  const logMessage = `Enemy plays ${playedCard.name} (${playedCard.manaCost} mana)`;

  return {
    newState,
    logMessage,
    actionMessage,
    playedCard
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
    const playerTauntMinions = getTauntMinions(newState.player.board);
    const hasTauntBlocker = playerTauntMinions.length > 0;

    if (hasTauntBlocker) {
      logMessages.push(`Enemy must attack Taunt minions`);

      for (const attacker of attackingMinions) {
        const playerTauntMinions = getTauntMinions(newState.player.board);

        if (playerTauntMinions.length === 0) break;

        const target = playerTauntMinions[0];
        const combatResult = handleMinionCombat(attacker, target);

        logMessages.push(`${attacker.name} attacks ${target.name}`);

        // Update boards
        newState.ai.board = updateBoardAfterCombat(
          newState.ai.board,
          attacker.instanceId,
          combatResult.updatedAttacker
        );
        
        newState.player.board = updateBoardAfterCombat(
          newState.player.board,
          target.instanceId,
          combatResult.updatedTarget
        );

        if (combatResult.targetDied) {
          logMessages.push(`${target.name} dies!`);

        }
        if (combatResult.attackerDied) {
          logMessages.push(`${attacker.name} dies!`);
        }
      }
    }

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