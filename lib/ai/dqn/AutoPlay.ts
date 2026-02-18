// AutoPlay - Self-Play Training System
// Handles the complete training loop:
// 1. Play full games automatically
// 2. Store experiences in replay buffer
// 3. Train the DQN Agent
// 4. Track and report progress

import { BattleState, DeckArchetype, Player } from "@/lib/types/game";
import { DQNAgent, TrainingStats } from "./DQNAgent";
import { calculateReward, DEFAULT_REWARDS, RewardConfig } from "./RewardSystem";
import { decodeAction, getLegalActions, isActionLegal } from "./ActionSpace";
import {
  createArchetypeDeck,
  drawCards,
  removeCardFromHand,
} from "@/lib/game/deckManager";
import {
  incrementTurn,
  checkGameOver,
  createMinion,
  handleMinionCombat,
  updateBoardAfterCombat,
} from "@/lib/game/gameLogic";
import { processAbilities } from "@/lib/game/abilitySystem";

// All data needed for training
interface TrainingConfig {
  episodes: number; // Number of games to play
  maxTurnsPerGame: number; // Max turns before draw (default: 50)
  rewardConfig: RewardConfig; // Reward weights
  trainEveryNSteps: number; // How often to train (default: 1 = every step)
  saveEveryNEpisodes: number; // How often to save progress (default: 100)
  logEveryNEpisodes: number; // How often to log stats (default: 10)
  opponentType: "self" | "random"; // Who to play against
  aiDeckType: DeckArchetype; // which deck the AI uses
  opponentDeckType: DeckArchetype; // which deck opponent uses
}

// Default values for all data needed during training
const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
  episodes: 1000,
  maxTurnsPerGame: 50,
  rewardConfig: DEFAULT_REWARDS,
  trainEveryNSteps: 1,
  saveEveryNEpisodes: 100,
  logEveryNEpisodes: 10,
  opponentType: "self",
  aiDeckType: "fire",
  opponentDeckType: "fire",
};

// Values to show in UI for testing/debugging
// Shows end of episode data
interface EpisodeResult {
  episodeNumber: number;
  winner: "ai" | "player" | "draw";
  turns: number;
  totalReward: number;
  finalHealth: number;
  opponentFinalHealth: number;
  illegalActions: number;
}

// Values to show in UI for testing/debugging
// Shows periodic updates to training progress
export interface TrainingProgress {
  episodesCompleted: number;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageReward: number;
  averageTurns: number;
  currentEpsilon: number;
  trainingStats?: TrainingStats;
}

// Clean game state for training sessions
function initializeGameState(
  aiDeckType: DeckArchetype,
  opponentDeckType: DeckArchetype,
): BattleState {
  // Initialize decks with given arguments
  const aiDeck = createArchetypeDeck(aiDeckType);
  const opponentDeck = createArchetypeDeck(opponentDeckType);

  // Draw starting hands
  const aiDraw = drawCards(aiDeck, 4);
  const opponentDraw = drawCards(opponentDeck, 4);

  return {
    ai: {
      health: 30,
      mana: 1,
      maxMana: 1,
      hand: aiDraw.drawn,
      board: [],
      deck: aiDraw.remaining,
      fatigueCounter: 0,
    },
    player: {
      health: 30,
      mana: 1,
      maxMana: 1,
      hand: opponentDraw.drawn,
      board: [],
      deck: opponentDraw.remaining,
      fatigueCounter: 0,
    },
    currentTurn: "ai",
    turnNumber: 1,
    gameOver: false,
    combatLog: [],
  };
}

// Flip the game state perspective for when the AI is playing itself
// Converts AI to Player, or vice-versa
function flipStatePerspective(state: BattleState): BattleState {
  return {
    ...state,
    ai: state.player,
    player: state.ai,
    currentTurn: state.currentTurn === "ai" ? "player" : "ai",
  };
}

// Execute a valid action in the current game state
function executeAction(
  action: number,
  state: BattleState,
  isAI: boolean = true,
): BattleState {
  const gameAction = decodeAction(action);

  // Only deep copy the parts that change (memory optimization)
  const newAI: Player = isAI
    ? {
        ...state.ai,
        board: [...state.ai.board],
        hand: [...state.ai.hand],
      }
    : state.ai;

  const newPlayer: Player = !isAI
    ? {
        ...state.player,
        board: [...state.player.board],
        hand: [...state.player.hand],
      }
    : state.player;

  let newState: BattleState = {
    ...state,
    ai: newAI,
    player: newPlayer,
    combatLog: [...state.combatLog],
  };

  switch (gameAction.type) {
    case "play_card": {
      if (gameAction.cardIndex === undefined) break;

      const card = (isAI ? newState.ai : newState.player).hand[
        gameAction.cardIndex
      ];
      if (!card) break;

      if (isAI) {
        newState.ai = {
          ...newState.ai,
          hand: removeCardFromHand(newState.ai.hand, gameAction.cardIndex),
          mana: newState.ai.mana - card.manaCost,
          board:
            card.type === "minion"
              ? [...newState.ai.board, createMinion(card)]
              : newState.ai.board,
        };
      } else {
        newState.player = {
          ...newState.player,
          hand: removeCardFromHand(newState.player.hand, gameAction.cardIndex),
          mana: newState.player.mana - card.manaCost,
          board:
            card.type === "minion"
              ? [...newState.player.board, createMinion(card)]
              : newState.player.board,
        };
      }

      // Process battlecry (works for both minions and spells)
      newState = processAbilities(card, "battlecry", newState, isAI);
      break;
    }

    case "attack_minion": {
      if (
        gameAction.attackerIndex === undefined ||
        gameAction.targetIndex === undefined
      )
        break;

      const attackerBoard = isAI ? newState.ai.board : newState.player.board;
      const targetBoard = isAI ? newState.player.board : newState.ai.board;

      const attacker = attackerBoard[gameAction.attackerIndex];
      const target = targetBoard[gameAction.targetIndex];

      if (!attacker || !target) break;

      const combatResult = handleMinionCombat(attacker, target);

      if (isAI) {
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
      } else {
        newState.player.board = updateBoardAfterCombat(
          newState.player.board,
          attacker.instanceId,
          combatResult.updatedAttacker,
        );
        newState.ai.board = updateBoardAfterCombat(
          newState.ai.board,
          target.instanceId,
          combatResult.updatedTarget,
        );
      }

      // Process deathrattles
      if (combatResult.targetDied && target.abilities) {
        newState = processAbilities(target, "deathrattle", newState, !isAI);
      }
      if (combatResult.attackerDied && attacker.abilities) {
        newState = processAbilities(attacker, "deathrattle", newState, isAI);
      }
      break;
    }

    case "attack_face": {
      if (gameAction.attackerIndex === undefined) break;

      const attacker = (isAI ? newState.ai : newState.player).board[
        gameAction.attackerIndex
      ];
      if (!attacker) break;

      if (isAI) {
        newState.player.health -= attacker.attack;
        newState.ai.board = newState.ai.board.map((m) =>
          m.instanceId === attacker.instanceId ? { ...m, canAttack: false } : m,
        );
      } else {
        newState.ai.health -= attacker.attack;
        newState.player.board = newState.player.board.map((m) =>
          m.instanceId === attacker.instanceId ? { ...m, canAttack: false } : m,
        );
      }
      break;
    }

    case "end_turn": {
      // All turn logic handled in incrementTurn
      const turnResult = incrementTurn(
        newState.turnNumber,
        newState.ai.maxMana,
        newState.ai,
        newState.player,
      );

      newState = {
        ...newState,
        ai: turnResult.ai,
        player: turnResult.opponent,
        turnNumber: turnResult.turnNumber,
        currentTurn: newState.currentTurn === "ai" ? "player" : "ai",
      };
      break;
    }
  }

  // Check if game ended
  const gameResult = checkGameOver(newState.player.health, newState.ai.health);
  newState.gameOver = gameResult.gameOver;
  newState.winner = gameResult.winner;

  return newState;
}

// Swap perspective and take the opponent's action
function selectOpponentAction(
  state: BattleState,
  agent: DQNAgent,
  opponentType: "self" | "random",
): number {
  if (opponentType === "self") {
    // Self-play: use same agent from opponent's perspective
    const flippedState = flipStatePerspective(state);
    return agent.selectAction(flippedState, true);
  } else {
    // Random opponent
    const legalActions = getLegalActions(state, false);

    if (legalActions.length === 0) {
      return 67; // End turn if no legal actions
    }

    return legalActions[Math.floor(Math.random() * legalActions.length)];
  }
}

// Play a single episode (episode = one complete game of Five Realms)
async function playEpisode(
  agent: DQNAgent,
  config: TrainingConfig = DEFAULT_TRAINING_CONFIG,
): Promise<EpisodeResult> {
  // Initialize game
  agent.startEpisode();
  let state = initializeGameState(config.aiDeckType, config.opponentDeckType);
  let totalReward = 0;
  let aiStepCount = 0;
  let illegalActionCount = 0;

  // Safety: prevent infinite loops
  let consecutiveSameTurns = 0;
  const MAX_CONSECUTIVE_SAME_TURNS = 10;

  // Play until game ends or max turns reached
  while (!state.gameOver && state.turnNumber <= config.maxTurnsPerGame) {
    const prevTurn = state.currentTurn;

    // AI's turn
    if (state.currentTurn === "ai") {
      const prevState = { ...state };

      // Select action (epsilon-greedy)
      let action = agent.selectAction(state, true);

      // Validate action is legal (safety check)
      if (!isActionLegal(decodeAction(action), state, true)) {
        illegalActionCount++;
        console.warn(
          `[AutoPlay] Illegal action ${action} selected! Falling back to random legal action.`,
        );

        // Fallback to random legal action
        const legalActions = getLegalActions(state, true);
        if (legalActions.length > 0) {
          action =
            legalActions[Math.floor(Math.random() * legalActions.length)];
        } else {
          action = 67; // End turn if no legal actions
        }
      }

      // Execute action
      const newState = executeAction(action, state, true);

      // Calculate reward
      const reward = calculateReward(
        prevState,
        action,
        newState,
        newState.gameOver,
        config.rewardConfig,
      );

      totalReward += reward;

      // Store experience
      agent.storeExperience(
        prevState,
        action,
        reward,
        newState,
        newState.gameOver,
      );

      // Increment AI step count
      aiStepCount++;

      // Train periodically (only on AI turns)
      if (aiStepCount % config.trainEveryNSteps === 0) {
        await agent.train();
      }

      state = newState;
    }
    // Opponent's turn
    else {
      const action = selectOpponentAction(state, agent, config.opponentType);
      state = executeAction(action, state, false);
    }

    // Safety check: detect infinite loops
    if (state.currentTurn === prevTurn) {
      consecutiveSameTurns++;
      if (consecutiveSameTurns >= MAX_CONSECUTIVE_SAME_TURNS) {
        console.error("[AutoPlay] Infinite loop detected! Force ending game.");
        state.gameOver = true;
        state.winner = "player"; // AI loses if it causes an infinite loop
        break;
      }
    } else {
      consecutiveSameTurns = 0;
    }
  }

  // Determine winner
  // Updated to account for draw matches so that win rate tracking is not corrupted
  // Rare edge cases of draw matches accounted for
  let winner: "ai" | "player" | "draw";
  if (state.gameOver) {
    if (state.winner === "ai") {
      winner = "ai";
    } else if (state.winner === "player") {
      winner = "player";
    } else {
      winner = "draw"; // gameOver but no winner (both hit 0 simultaneously)
    }
  } else {
    winner = "draw"; // Max turns reached
  }

  // Log if illegal actions occurred
  if (illegalActionCount > 0) {
    console.warn(
      `[AutoPlay] Episode had ${illegalActionCount} illegal action attempts`,
    );
  }

  return {
    episodeNumber: 0, // Will be set by caller
    winner,
    turns: state.turnNumber,
    totalReward,
    finalHealth: state.ai.health,
    opponentFinalHealth: state.player.health,
    illegalActions: illegalActionCount,
  };
}

// Train the DQN Agent over multiple episodes
async function trainAgent(
  agent: DQNAgent,
  config: Partial<TrainingConfig> = {},
  onProgress?: (progress: TrainingProgress) => void,
): Promise<TrainingProgress> {
  const fullConfig = { ...DEFAULT_TRAINING_CONFIG, ...config };

  const results: EpisodeResult[] = [];
  let wins = 0;
  let losses = 0;
  let draws = 0;

  // Progress recovery: check if training is resuming
  const savedProgress =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("five-realms-training-progress")
      : null;
  const startEpisode = savedProgress ? JSON.parse(savedProgress).episode : 0;

  if (startEpisode > 0) {
    console.log(`[AutoPlay] Resuming training from episode ${startEpisode}`);
  }

  console.log("[AutoPlay] Starting training...");
  console.log(`[AutoPlay] Episodes: ${startEpisode} → ${fullConfig.episodes}`);
  console.log(`[AutoPlay] Max turns: ${fullConfig.maxTurnsPerGame}`);
  console.log(`[AutoPlay] Opponent: ${fullConfig.opponentType}`);

  for (let episode = startEpisode; episode < fullConfig.episodes; episode++) {
    try {
      // Play one game
      const result = await playEpisode(agent, fullConfig);
      result.episodeNumber = episode + 1;
      results.push(result);

      // Track wins/losses
      if (result.winner === "ai") wins++;
      else if (result.winner === "player") losses++;
      else draws++;

      // Save progress for recovery
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          "five-realms-training-progress",
          JSON.stringify({
            episode: episode + 1,
            timestamp: Date.now(),
          }),
        );
      }

      // Log progress
      if ((episode + 1) % fullConfig.logEveryNEpisodes === 0) {
        const stats = agent.getStats();
        const recentResults = results.slice(-100);
        const recentWins = recentResults.filter(
          (r) => r.winner === "ai",
        ).length;
        const recentWinRate = recentWins / recentResults.length;
        const recentIllegalActions = recentResults.reduce(
          (sum, r) => sum + r.illegalActions,
          0,
        );

        console.log(`\n[Episode ${episode + 1}/${fullConfig.episodes}]`);
        console.log(
          `  Win Rate (last 100): ${(recentWinRate * 100).toFixed(1)}%`,
        );
        console.log(`  Epsilon: ${stats.epsilon.toFixed(3)}`);
        console.log(`  Avg Reward: ${stats.avgReward.toFixed(2)}`);
        console.log(`  Avg Loss: ${stats.avgLoss.toFixed(4)}`);
        console.log(`  Buffer: ${stats.bufferSize} experiences`);
        console.log(`  Training Steps: ${stats.trainingSteps}`);
        if (recentIllegalActions > 0) {
          console.log(
            `Illegal Actions: ${recentIllegalActions} (last 100 episodes)`,
          );
        }

        // Progress callback
        if (onProgress) {
          const progress: TrainingProgress = {
            episodesCompleted: episode + 1,
            totalGames: fullConfig.episodes,
            wins,
            losses,
            draws,
            winRate: recentWinRate,
            averageReward: stats.avgReward,
            averageTurns:
              recentResults.reduce((sum, r) => sum + r.turns, 0) /
              recentResults.length,
            currentEpsilon: stats.epsilon,
            trainingStats: stats,
          };
          onProgress(progress);
        }
      }

      // Save periodically
      if ((episode + 1) % fullConfig.saveEveryNEpisodes === 0) {
        await agent.save();
        console.log(`[AutoPlay] Progress saved at episode ${episode + 1}`);
      }
    } catch (error) {
      console.error(`[AutoPlay] Error in episode ${episode}:`, error);
      // Save progress before potentially crashing
      await agent.save();
      throw error; // Re-throw after saving
    }
  }

  // Final save
  await agent.save();

  // Clear progress recovery data
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("five-realms-training-progress");
  }

  console.log("\n[AutoPlay] Training complete!");

  // Calculate final stats
  const recentResults = results.slice(-100);
  const recentWins = recentResults.filter((r) => r.winner === "ai").length;
  const finalStats = agent.getStats();

  const finalProgress: TrainingProgress = {
    episodesCompleted: fullConfig.episodes,
    totalGames: fullConfig.episodes,
    wins,
    losses,
    draws,
    winRate: recentWins / recentResults.length,
    averageReward: finalStats.avgReward,
    averageTurns:
      recentResults.reduce((sum, r) => sum + r.turns, 0) / recentResults.length,
    currentEpsilon: finalStats.epsilon,
    trainingStats: finalStats,
  };

  console.log("\n=== Final Results ===");
  console.log(`Total Games: ${wins + losses + draws}`);
  console.log(`Wins: ${wins} | Losses: ${losses} | Draws: ${draws}`);
  console.log(
    `Win Rate (last 100): ${(finalProgress.winRate * 100).toFixed(1)}%`,
  );
  console.log(`Final Epsilon: ${finalStats.epsilon.toFixed(3)}`);

  return finalProgress;
}

// Train an agent on all deck mathcup combinations available in Five Realms
// This is to prevent catastrophic forgetting;
// Uses small interleaved batches on all matchups in training
export async function trainUniversalAgent(
  agent: DQNAgent,
  config: {
    episodesPerMatchup: number;
    deckTypes: DeckArchetype[];
    batchSize?: number;
    maxTurnsPerGame?: number;
    opponentType?: "self" | "random";
    saveEveryNBatches?: number;
  },
  onProgress?: (progress: TrainingProgress) => void,
): Promise<TrainingProgress> {
  const {
    episodesPerMatchup,
    deckTypes,
    batchSize = 50,
    maxTurnsPerGame = 50,
    opponentType = "self",
    saveEveryNBatches = 5,
  } = config;

  // Generate all matchup combinations
  const matchups: Array<{ ai: DeckArchetype; opp: DeckArchetype }> = [];
  for (const aiDeck of deckTypes) {
    for (const oppDeck of deckTypes) {
      matchups.push({ ai: aiDeck, opp: oppDeck });
    }
  }

  const totalEpisodes = episodesPerMatchup * matchups.length;
  const batchesPerMatchup = Math.ceil(episodesPerMatchup / batchSize);

  console.log("\n=== Universal Agent Training ===");
  console.log(`Deck types: ${deckTypes.join(", ")}`);
  console.log(
    `Matchups: ${matchups.length} (${matchups.map((m) => `${m.ai} vs ${m.opp}`).join(", ")})`,
  );
  console.log(`Episodes per matchup: ${episodesPerMatchup}`);
  console.log(`Batch size: ${batchSize}`);
  console.log(`Total episodes: ${totalEpisodes}`);
  console.log(
    `Batches: ${batchesPerMatchup} per matchup, ${batchesPerMatchup * matchups.length} total\n`,
  );

  let totalWins = 0;
  let totalLosses = 0;
  let totalDraws = 0;
  let episodesCompleted = 0;

  // Train in interleaved batches to prevent forgetting
  for (let batch = 0; batch < batchesPerMatchup; batch++) {
    console.log(`\n--- Batch ${batch + 1}/${batchesPerMatchup} ---`);

    // Train each matchup for `batchSize` episodes
    for (const matchup of matchups) {
      const batchEpisodes = Math.min(
        batchSize,
        episodesPerMatchup - batch * batchSize,
      );

      if (batchEpisodes <= 0) continue;

      console.log(
        `Training ${matchup.ai} vs ${matchup.opp} (${batchEpisodes} episodes)...`,
      );

      const progress = await trainAgent(
        agent,
        {
          episodes: batchEpisodes,
          aiDeckType: matchup.ai,
          opponentDeckType: matchup.opp,
          maxTurnsPerGame,
          opponentType,
          logEveryNEpisodes: Math.max(1, Math.floor(batchEpisodes / 5)),
          saveEveryNEpisodes: 999999,
        },
        onProgress,
      );

      totalWins += progress.wins;
      totalLosses += progress.losses;
      totalDraws += progress.draws;
      episodesCompleted += batchEpisodes;
    }

    // Save after each batch
    if ((batch + 1) % saveEveryNBatches === 0) {
      await agent.save();
      console.log(`\n[Progress saved after batch ${batch + 1}]`);
    }

    // Report progress
    const stats = agent.getStats();
    console.log(`\n=== Batch ${batch + 1} Complete ===`);
    console.log(`Episodes: ${episodesCompleted}/${totalEpisodes}`);
    console.log(`Overall W/L/D: ${totalWins}/${totalLosses}/${totalDraws}`);
    console.log(`Epsilon: ${stats.epsilon.toFixed(3)}`);
    console.log(`Avg Reward: ${stats.avgReward.toFixed(2)}`);
    console.log(`Buffer: ${stats.bufferSize} experiences`);
  }

  // Final save
  await agent.save();

  const finalStats = agent.getStats();
  const finalProgress: TrainingProgress = {
    episodesCompleted: totalEpisodes,
    totalGames: totalEpisodes,
    wins: totalWins,
    losses: totalLosses,
    draws: totalDraws,
    winRate: totalWins / (totalWins + totalLosses + totalDraws),
    averageReward: finalStats.avgReward,
    averageTurns: 0,
    currentEpsilon: finalStats.epsilon,
    trainingStats: finalStats,
  };

  console.log("\n=== Universal Training Complete ===");
  console.log(`Total Episodes: ${totalEpisodes}`);
  console.log(`Total W/L/D: ${totalWins}/${totalLosses}/${totalDraws}`);
  console.log(`Overall Win Rate: ${(finalProgress.winRate * 100).toFixed(1)}%`);
  console.log(`Final Epsilon: ${finalStats.epsilon.toFixed(3)}`);

  return finalProgress;
}
