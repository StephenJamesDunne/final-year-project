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
  matchupKey: string;       // "aiDeck_vs_oppDeck" - used for per-matchup stat tracking
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
  matchupKey: "fire_vs_fire",
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
  const flippedWinner =
    state.winner === "ai"
      ? "player"
      : state.winner === "player"
        ? "ai"
        : state.winner; // handles undefined as the winner in case of a draw

  return {
    ...state,
    ai: state.player,
    player: state.ai,
    currentTurn: state.currentTurn === "ai" ? "player" : "ai",
    winner: flippedWinner,
  };
}

// Execute a valid action in the current game state
function executeAction(
  action: number,
  state: BattleState,
  isAI: boolean = true,
): BattleState {
  const gameAction = decodeAction(action);

  // Need to deep copy for the replay buffer, in case any of these values in state change
  const copyPlayer = (p: Player): Player => ({
    ...p,
    hand: [...p.hand],
    board: p.board.map((m) => ({ ...m })),
  });

  const newAI: Player = isAI ? copyPlayer(state.ai) : state.ai;
  const newPlayer: Player = !isAI ? copyPlayer(state.player) : state.player;

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
      const current = isAI ? newState.ai : newState.player;
      const opponent = isAI ? newState.player : newState.ai;

      // All turn logic handled in incrementTurn
      const turnResult = incrementTurn(
        newState.turnNumber,
        current.maxMana,
        current,
        opponent,
      );

      newState = {
        ...newState,
        ai: isAI ? turnResult.ai : turnResult.opponent,
        player: isAI ? turnResult.opponent : turnResult.ai,
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
  const MAX_CONSECUTIVE_SAME_TURNS = 10;
  let consecutiveSameTurns = 0; // moved outside while loop so it persists between iterations

  // Play until game ends or max turns reached
  while (!state.gameOver && state.turnNumber <= config.maxTurnsPerGame) {
    const prevTurnNumber = state.turnNumber;

    // AI's turn
    if (state.currentTurn === "ai") {
      const prevState = { ...state };

      // Select action (epsilon-greedy)
      let action = agent.selectAction(state, true);

      const legalActions = getLegalActions(state, true);

      // Validate action is legal (safety check)
      if (!isActionLegal(decodeAction(action), state, true)) {
        illegalActionCount++;

        // Fallback to random legal action
        if (legalActions.length > 0) {
          action =
            legalActions[Math.floor(Math.random() * legalActions.length)];
        } else {
          action = 67; // End turn if no legal actions
        }
      }

      // Execute action
      const newState = executeAction(action, state, true);

      // Check whether the agent had at least one legal play_card action this turn
      // Used by calculateReward to determine if the penalty for wasted mana should apply
      const hadLegalPlay = legalActions.some(a => a >= 0 && a <= 9);

      // Check whether the action was a clean kill (attacker survived, target died)
      // Decoded from the action index instead of pulling in decodeAction as another dependency
      // Attack minion actions start at index 10 (10-59)
      // Then divide or modulo for attacker/target indices in the 7x7 grid
      let cleanKill = false;
      if (action >= 10 && action <= 59) {
        const attackerIndex = Math.floor((action - 10) / 7);
        const targetIndex = (action - 10) % 7;

        const attacker = prevState.ai.board[attackerIndex];
        const target = prevState.player.board[targetIndex];

        // Compare the instance ids of both the attacker and the target in both the previous board state and the new board state
        if (attacker && target) {
          const attackerSurvived = newState.ai.board.some(m => m.instanceId === attacker.instanceId);
          const targetDied = !newState.player.board.some(m => m.instanceId === target.instanceId);
          cleanKill = attackerSurvived && targetDied;
        }
      }

      // Calculate reward
      const reward = calculateReward(
        prevState,
        action,
        newState,
        newState.gameOver,
        config.rewardConfig,
        { hadLegalPlay, cleanKill },
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

      // Safety check: inside AI block so prevState and action are in scope
      if (
        action === 67 &&
        state.turnNumber === prevTurnNumber &&
        !state.gameOver
      ) {
        consecutiveSameTurns++;

        if (consecutiveSameTurns >= MAX_CONSECUTIVE_SAME_TURNS) {

          state.gameOver = true;
          state.winner = undefined; // agent is stuck, draw match

          // Store terminal experience with no reward or penalty given
          agent.storeExperience(prevState, action, 0, state, true);
          break;
        }
      } else if (state.turnNumber !== prevTurnNumber) {
        consecutiveSameTurns = 0;
      }
    }
    // Opponent's turn
    else {
      const prevTurnNumberOpp = state.turnNumber;
      const action = selectOpponentAction(state, agent, config.opponentType);
      state = executeAction(action, state, false);

      if (
        action === 67 &&
        state.turnNumber === prevTurnNumberOpp &&
        !state.gameOver
      ) {
        consecutiveSameTurns++;
        if (consecutiveSameTurns >= MAX_CONSECUTIVE_SAME_TURNS) {

          state.gameOver = true;
          state.winner = undefined; // opponent is stuck, draw match
          break;
        }
      } else if (state.turnNumber !== prevTurnNumberOpp) {
        consecutiveSameTurns = 0;
      }
    }
  }

  // Determine winner
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
): Promise<TrainingProgress> {
  const fullConfig = { ...DEFAULT_TRAINING_CONFIG, ...config };

  const results: EpisodeResult[] = [];
  let wins = 0;
  let losses = 0;
  let draws = 0;

  // Progress recovery: check if training is resuming
  const startEpisode = 0;

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

      // Record per-matchup outcome for balancing analysis
      agent.recordEpisodeResult(
        fullConfig.matchupKey,
        result.winner,
        result.turns,
        result.finalHealth,
        result.opponentFinalHealth,
      );

      // One-liner log: global episode count, matchup, running win rate, epsilon, avg reward
      if ((episode + 1) % fullConfig.logEveryNEpisodes === 0) {
        const stats = agent.getStats();
        const recentResults = results.slice(-100);
        const recentWins = recentResults.filter((r) => r.winner === "ai").length;
        const recentWinRate = (recentWins / recentResults.length * 100).toFixed(1);
        const recentIllegalActions = recentResults.reduce((sum, r) => sum + r.illegalActions, 0);

        console.log(
          `  [ep ${result.episodeNumber}/${fullConfig.episodes}] ${fullConfig.matchupKey}` +
          ` | win% ${recentWinRate}% | Epsilon ${stats.epsilon.toFixed(3)} | avg reward ${stats.avgReward.toFixed(2)}` +
          (recentIllegalActions > 0 ? ` | illegal actions ${recentIllegalActions}` : "")
        );
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
  }
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

      const matchupKey = `${matchup.ai}_vs_${matchup.opp}`;
      console.log(`  ${matchupKey} (${batchEpisodes} episodes)...`);

      const progress = await trainAgent(
        agent,
        {
          episodes: batchEpisodes,
          aiDeckType: matchup.ai,
          opponentDeckType: matchup.opp,
          matchupKey,
          maxTurnsPerGame,
          opponentType,
          logEveryNEpisodes: Math.max(1, Math.floor(batchEpisodes / 5)),
          saveEveryNEpisodes: 999999,
        },
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

    // Batch boundary summary: global stats + per-matchup table
    const stats = agent.getStats();
    const globalWinRate = (totalWins / (totalWins + totalLosses + totalDraws) * 100).toFixed(1);

    console.log(`\n--- Batch ${batch + 1}/${batchesPerMatchup} complete ---`);
    console.log(`  Episodes: ${episodesCompleted}/${totalEpisodes} | Win%: ${globalWinRate}% | Epsilon: ${stats.epsilon.toFixed(3)} | Avg reward: ${stats.avgReward.toFixed(2)}`);
    console.log(`  Matchup results:`);
    for (const [key, m] of Object.entries(agent.getMatchupStats())) {
      console.log(`    ${key}: ${m.episodes} ep | win% ${(m.winRate * 100).toFixed(1)}% | draw% ${(m.drawRate * 100).toFixed(1)}% | avg turns ${m.avgTurns.toFixed(1)} | avg health delta ${m.avgHealthDifferential.toFixed(1)}`);
    }
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

  const finalGlobalWinRate = (finalProgress.winRate * 100).toFixed(1);

  console.log(`\n=== Training Complete ===`);
  console.log(`  Total episodes: ${totalEpisodes} | Win%: ${finalGlobalWinRate}% | Final Epsilon: ${finalStats.epsilon.toFixed(3)}`);
  console.log(`  W/L/D: ${totalWins}/${totalLosses}/${totalDraws}`);
  console.log(`  Matchup results:`);

  for (const [key, m] of Object.entries(agent.getMatchupStats())) {
    console.log(`    ${key}: ${m.episodes} episodes | wins ${(m.winRate * 100).toFixed(1)}% | draws ${(m.drawRate * 100).toFixed(1)}% | avg turns ${m.avgTurns.toFixed(1)} | avg health delta ${m.avgHealthDifferential.toFixed(1)}`);
  }

  return finalProgress;
}
