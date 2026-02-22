// rewardSystem.ts:
// Most important part of training the DQN agent
// It defines what the AI considers "good play" vs "bad play"
//
// Reward categories:
// 1. Rewards for Game Over States:
//      - Win: +10.0 (largest reward)
//      - Loss: -10.0 (largest penalty)
//
// 2. Rewards for Health Values:
//      - AI health gained: +0.3 per point
//      - AI health lost: -0.3 per point
//      - Enemy health lost: +0.3 per point
//      - Enemy health gained: -0.3 per point
// 
// 3. Rewards for Board Control:
//      - Kill enemy minion: +0.5 per minion
//      - Lose own minion: -0.4 per minion
//      - Board advantage: +0.2 * (AI's total stats on board - enemy's total stats)
//
// 4. Rewards for card advantage:
//      - Draw cards: +0.1 per card
//      - Play cards: -0.05 per card
//
// 5. Rewards for mana efficiency/playing "on curve":
//      - Use mana: +0.05 per mana spent
//      - Waste mana: -0.02 per mana unused (ending a turn with leftover mana)
//
// Can tune/change these values according to the game state over time, provide a balanced AI agent
// And make it change its strategy to better provide a win over its current strategy 

import { BattleState, Minion } from '@/lib/types/game';

// Reward configuration: allows for easy experimentation with different playstyles
// Weights of each can be tuned to create different AI types
// (Custom configurations at bottom of this file)
export interface RewardConfig {
  // Game Over state rewards
  winReward: number;
  lossReward: number;
  
  // Health rewards
  healthChange: number;           // Reward per point of health gained/lost
  enemyHealthChange: number;      // Reward per point of enemy health lost/gained
  
  // Board control rewards
  minionKilled: number;           // Bonus for killing enemy minion
  minionLost: number;             // Penalty for losing own minion
  boardAdvantage: number;         // Reward for having stronger board
  
  // Card advantage rewards
  cardDraw: number;               // Reward for drawing cards
  
  // Mana efficiency rewards
  manaUsed: number;               // Small bonus for using mana
  manaWasted: number;             // Small penalty for ending turn with mana
}

// Default values for a configuration of rewards
// Blanaced, Tempo style approach to gameplay
export const DEFAULT_REWARDS: RewardConfig = {
  // Game over rewards - should always be largest
  winReward: 10.0,
  lossReward: -10.0,
  
  // Health rewards - significant but not dominant strategy
  healthChange: 0.3,
  enemyHealthChange: 0.3,
  
  // Board control - most important non-game-ending reward
  minionKilled: 0.5,
  minionLost: -0.4,
  boardAdvantage: 0.2,
  
  // Card advantage - medium importance
  cardDraw: 0.1,
  
  // Mana efficiency - small nudges toward good habits
  manaUsed: 0.05,
  manaWasted: -0.02,
};

// Calculate reward for a state transition
// Called after every action the AI takes
export function calculateReward(
  prevState: BattleState,
  action: number,
  newState: BattleState,
  done: boolean,
  config: RewardConfig = DEFAULT_REWARDS
): number {
  
  // Game over, most important
  if (done) {
    if (newState.winner === 'ai') {
      return config.winReward;  // +10.0 - largest reward for winning
    } else {
      return config.lossReward; // -10.0 - largest penalty for losing
    }
  }
  
  // Step rewards (during game) - accumulate over time
  let reward = 0;
  
  // Encourage AI to preserve own health and damage enemy
  const aiHealthDelta = newState.ai.health - prevState.ai.health;
  const playerHealthDelta = newState.player.health - prevState.player.health;
  
  reward += aiHealthDelta * config.healthChange;              // Gain health = positive, lose health = negative
  reward += -playerHealthDelta * config.enemyHealthChange;    // Enemy loses health = positive, enemy gains = negative
  
  // Encourage AI to maintain board presence and remove enemy minions
  const aiMinionCountDelta = newState.ai.board.length - prevState.ai.board.length;
  const playerMinionCountDelta = newState.player.board.length - prevState.player.board.length;
  
  // Bonus for killing enemy minions
  if (playerMinionCountDelta < 0) {
    reward += Math.abs(playerMinionCountDelta) * config.minionKilled;
  }
  
  // Penalty for losing own minions
  if (aiMinionCountDelta < 0) {
    reward += aiMinionCountDelta * config.minionLost; // minionLost is always negative
  }
  
  // Board advantage reward - having stronger board is good
  const aiBoardStrength = calculateBoardStrength(newState.ai.board);
  const playerBoardStrength = calculateBoardStrength(newState.player.board);
  const prevAIBoardStrength = calculateBoardStrength(prevState.ai.board);
  const prevPlayerBoardStrength = calculateBoardStrength(prevState.player.board);
  
  const boardAdvantageDelta = 
    (aiBoardStrength - playerBoardStrength) - 
    (prevAIBoardStrength - prevPlayerBoardStrength);
  
  reward += boardAdvantageDelta * config.boardAdvantage;
  
  // Encourage drawing cards (more options = better)
  const aiCardDelta = newState.ai.hand.length - prevState.ai.hand.length;
  if (aiCardDelta > 0) {
    reward += aiCardDelta * config.cardDraw;
  }
  
  // Encourage playing on curve as often as possible
  const manaUsed = prevState.ai.mana - newState.ai.mana;
  reward += manaUsed * config.manaUsed;
  
  // Small penalty for ending turn with unused mana (only when ending turn)
  // Action 67 = end turn (from actionSpace.ts)
  if (action === 67) {
    const manaWasted = prevState.ai.mana;
    reward += manaWasted * config.manaWasted;
  }
  
  return reward;
}

// Calculate board strength with simple heuristic
// minion attack + minion health contributes to strength as flat increment
function calculateBoardStrength(board: Minion[]): number {
  return board.reduce((total, minion) => {

    const strength = minion.attack + minion.currentHealth;
    
    return total + strength;
  }, 0);
}

// Custom reward configs for different strategies:
export function createAggressiveRewards(): RewardConfig {
  return {
    ...DEFAULT_REWARDS,
    enemyHealthChange: 0.6,  // Focus on face damage
    healthChange: 0.1,       // Don't care about own health
    boardAdvantage: 0.2,     // Board control less important
  };
}

export function createDefensiveRewards(): RewardConfig {
  return {
    ...DEFAULT_REWARDS,
    healthChange: 0.6,       // Preserve health heavily
    enemyHealthChange: 0.1,  // Face damage less important
    boardAdvantage: 0.4,     // Control board to survive
    minionLost: -0.7,        // Hate losing minions
  };
}

export function createTempoRewards(): RewardConfig {
  return {
    ...DEFAULT_REWARDS,
    boardAdvantage: 0.5,     // Maximize board control
    manaUsed: 0.2,           // Use mana efficiently
    manaWasted: -0.05,       // Not playing on curve should be disincentivised
    minionKilled: 0.7,       // Kill enemy minions aggressively
  };
}