import { BattleState, Player, Card, Minion } from "../types/game";
import {
  createMinion,
  getTauntMinions,
  handleMinionCombat,
  updateBoardAfterCombat,
  hasTaunt,
  boardHasTaunt,
} from "./gameLogic";
import { processAbilities } from "./abilitySystem";
import { findPlayableCard, removeCardFromHand } from "./deckManager";
import { select } from "framer-motion/client";
import { kill } from "process";

export interface AIAction {
  type: "play_card" | "attack" | "pass";
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
  // Priority 1: Play cards efficiently
  const cardAction = selectBestCardToPlay(aiState, gameState);
  if (cardAction) return cardAction;

  // Priority 2: Attack with minions if it improves board position or can go face for lethal
  const attackAction = selectBestAttack(aiState, gameState);
  if (attackAction) return attackAction;

  // Priority 3: Pass if no good plays available
  return { type: "pass" };
}

// Card Playing Logic
function selectBestCardToPlay(
  aiState: Player,
  gameState: BattleState,
): AIAction | null {
  const playableCards = aiState.hand
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => card.manaCost <= aiState.mana)
    .filter(({ card }) => card.type !== "minion" || aiState.board.length < 7); // Can't play minions if board is full

  if (playableCards.length === 0) {
    return null;
  }

  const scoredCards = playableCards.map(({ card, index }) => ({
    card,
    index,
    score: scoreCard(card, aiState, gameState)
  }));

  scoredCards.sort((a, b) => b.score - a.score);

  return {
    type: "play_card",
    cardIndex: scoredCards[0].index,
  };
}

function scoreCard(
  card: Card,
  aiState: Player,
  gameState: BattleState,
): number {
  let score = 0;

  // Prefer to play "on curve": cards that allow the AI to use all its mana per turn are more valuable
  const curveBonus = card.manaCost === aiState.mana ? 2 : 0;
  score += curveBonus;

  // Efficiency bonus: higher mana cost cards that can be played with current mana are more valuable
  const efficiencyBonus = card.manaCost / aiState.mana;
  score += efficiencyBonus;

  if (card.type === "minion") {
    // Flat linear increase in value based on combined stats (attack + health)
    const statValue = (card.attack || 0) + (card.health || 0);
    score += statValue * 0.5;

    if (gameState.player.board.length > 0) {
      const hasTauntAbility = card.abilities?.some((a) =>
        a.description.toLowerCase().includes("taunt"),
      );
      // Taunt minions are simply more valuable than non Taunt minions in every scenario
      if (hasTauntAbility) {
        score += 3;
      }
    }

    const hasChargeAbility = card.abilities?.some((a) =>
      a.description.toLowerCase().includes("charge"),
    );

    if (hasChargeAbility) {
      // Charge minions are more valuable than non-Charge minions
      score += 2;
    }

    // Prefer minions over spells when board is empty
    if (aiState.board.length === 0) score += 2;
  }

  if (card.type === "spell") {
    // Simple heuristic: spells that deal damage or have strong effects are more valuable
    const isDamageSpell = card.abilities?.some(
      (a) => a.type === "damage" && a.target === "enemy",
    );
    if (isDamageSpell && gameState.player.health <= 10) {
      score += 5; // Prioritize lethal damage
    }

    const isHealSpell = card.abilities?.some((a) => a.type === "heal");
    if (isHealSpell && aiState.health <= 10) {
      score += 3; // Prioritize healing spells when AI is low on health; less important than damage spells but still valuable
    }
  }

  if (aiState.board.length >= 5 && card.type === "minion") {
    // Avoid overextending on the board when presence is already strong; opponent may have board clears or AoE damage
    score -= 2;
  }

  return score;
}

function selectBestAttack(
  aiState: Player,
  gameState: BattleState,
): AIAction | null {
  const attackingMinions = aiState.board.filter((m) => m.canAttack);
  if (attackingMinions.length === 0) return null;

  const playerTauntMinions = getTauntMinions(gameState.player.board);

  if (playerTauntMinions.length > 0) {
    return selectBestTauntAttack(attackingMinions, playerTauntMinions);
  }

  return selectBestOpenAttack(attackingMinions, gameState);
}

function selectBestTauntAttack(
  attackers: Minion[],
  tauntTargets: Minion[],
): AIAction {
  // Attack with highest attack minion against lowest health Taunt to maximize chances of killing it, and minimizing retaliation damage
  let bestAttack: AIAction | null = null;
  let bestScore = -Infinity;

  for (const attacker of attackers) {
    for (const target of tauntTargets) {
      const score = scoreTrade(attacker, target);
      if (score > bestScore) {
        bestScore = score;
        bestAttack = {
          type: "attack",
          attackerId: attacker.instanceId,
          targetId: target.instanceId,
        };
      }
    }
  }

  return (
    bestAttack || {
      type: "attack",
      attackerId: attackers[0].instanceId,
      targetId: tauntTargets[0].instanceId,
    }
  );
}

function selectBestOpenAttack(
  attackers: Minion[],
  gameState: BattleState
): AIAction | null {

  // Get all enemy minions on the board to evaluate potential trades
  const enemyMinions = gameState.player.board;

  // Calculate total potential damage if attacking face
  const totalDamage = attackers.reduce((sum, m) => sum + m.attack, 0);

  // Prioritise going face if it results in lethal damage over any other play
  if (totalDamage >= gameState.player.health) {
    return {
      type: "attack",
      attackerId: attackers[0].instanceId,
      targetId: "face",
    };
  }

  // Otherwise, look for favorable trades to improve board position before going face
  if (enemyMinions.length > 0) {
    const bestTrade = findBestTrade(attackers, enemyMinions);
    if (bestTrade && bestTrade.score > 2) {
      return {
        type: "attack",
        attackerId: bestTrade.attacker.instanceId,
        targetId: bestTrade.target.instanceId,
      };
    }
  }

  // Default: attack face if no good trades available
  return {
    type: "attack",
    attackerId: attackers[0].instanceId,
    targetId: "face",
  };
}

// Calculate a score for a potential trade between an attacking minion and a target minion. Higher score means a more favorable trade for the attacker
function findBestTrade(
  attackers: Minion[], 
  targets: Minion[]
): { attacker: Minion; target: Minion; score: number } | null {
  let bestTrade = null;
  let bestScore = -Infinity;

  for (const attacker of attackers) {
    for (const target of targets) {
      const score = scoreTrade(attacker, target);
      if (score > bestScore) {
        bestScore = score;
        bestTrade = { attacker, target, score };
      }
    }
  }

  return bestTrade;
}

// Score a potential trade between an attacking minion and a target minion.
function scoreTrade(attacker: Minion, target: Minion): number {
  let score = 0;

  const killsTarget = attacker.attack >= target.currentHealth;
  if (killsTarget) {
    score += target.attack + target.health; // Value of killing the target
  }

  const survives = attacker.currentHealth > target.attack;
  if (survives) {
    score += attacker.attack + attacker.currentHealth; // Value of surviving the trade
  }

  if (killsTarget && survives) {
    score += 5; // Bonus for killing and surviving
  }

  // Trading up is more valuable than trading down:
  // If the attacker has higher combined stats than the target, it's a favorable trade
  const statDifference =
    target.attack + target.health - (attacker.attack + attacker.currentHealth);
  score += statDifference * 0.5;

  // Prefer removing high attack minions to reduce opponent's damage output
  score += target.attack * 0.3;

  return score;
}

export function executeAIPlayCard(
  cardIndex: number,
  gameState: BattleState,
): {
  newState: BattleState;
  logMessage: string;
  actionMessage: string;
  playedCard: Card;
} {
  const playedCard = { ...gameState.ai.hand[cardIndex] };
  let newState = { ...gameState };

  // Remove card from hand and reduce mana
  newState.ai = {
    ...newState.ai,
    hand: removeCardFromHand(newState.ai.hand, cardIndex),
    mana: newState.ai.mana - playedCard.manaCost,
  };

  if (playedCard.type === "minion") {
    const minion = createMinion(playedCard);
    newState.ai.board = [...newState.ai.board, minion];
  }

  // Process battlecry abilities
  newState = processAbilities(playedCard, "battlecry", newState, false);

  const actionMessage = `Playing ${playedCard.name}...`;
  const logMessage = `Enemy plays ${playedCard.name} (${playedCard.manaCost} mana)`;

  return {
    newState,
    logMessage,
    actionMessage,
    playedCard,
  };
}

export function executeAIAttacks(gameState: BattleState): {
  newState: BattleState;
  logMessages: string[];
  totalDamage: number;
} {
  let newState = { ...gameState };
  const attackingMinions = newState.ai.board.filter((m) => m.canAttack);
  let totalDamage = 0;
  let logMessages: string[] = [];

  if (attackingMinions.length === 0) {
    return { newState, logMessages, totalDamage };
  }

  const playerTauntMinions = getTauntMinions(newState.player.board);
  const hasTaunt = playerTauntMinions.length > 0;

  if (hasTaunt) {
    for (const attacker of attackingMinions) {
      const currentTauntMinions = getTauntMinions(newState.player.board);

      if (currentTauntMinions.length === 0) break;

      const target = currentTauntMinions[0];
      const combatResult = handleMinionCombat(attacker, target);

      logMessages.push(`${attacker.name} attacks ${target.name}`);

      newState.ai.board = updateBoardAfterCombat(
        newState.ai.board,
        attacker.instanceId,
        combatResult.updatedAttacker,
      );

      newState.player.board = updateBoardAfterCombat(
        newState.player.board,
        target.instanceId,
        combatResult.updatedTarget,
      );

      if (combatResult.targetDied) {
        logMessages.push(`${target.name} dies!`);
      }
      if (combatResult.attackerDied) {
        logMessages.push(`${attacker.name} dies!`);
      }
    }
  } else {
    // Only attack face when there's no Taunt
    logMessages.push(`Enemy attacks with ${attackingMinions.length} minion(s)`);

    attackingMinions.forEach((minion) => {
      newState.player.health -= minion.attack;
      totalDamage += minion.attack;
    });

    if (totalDamage > 0) {
      logMessages.push(`Enemy deals ${totalDamage} damage to you`);
    }

    // Mark minions as having attacked
    newState.ai.board = newState.ai.board.map((m) =>
      attackingMinions.some((attacker) => attacker.instanceId === m.instanceId)
        ? { ...m, canAttack: false }
        : m,
    );
  }

  return { newState, logMessages, totalDamage };
}

export function getAIDecisionDelay(): number {
  // Random delay between 500-1200ms to simulate thinking
  return Math.random() * 700 + 500;
}
