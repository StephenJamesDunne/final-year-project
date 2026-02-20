// DQNAgent "Brain" that combines all other DQN files
// - DQNModel - neural network
// - ExperienceReplay - memory buffer
// - Epsilon-Greedy strategy - how the agent learns
// - Action selection for decision making

import { DQNModel } from "./DQNModel";
import { ExperienceReplay } from "./ExperienceReplay";
import { encodeGameState } from "./stateEncoder";
import { BattleState } from "@/lib/types/game";
import * as fs from "fs";
import * as path from "path";

// Hyperparameters for the DQN Agent
export interface DQNAgentConfig {
  // Exploration parameters
  epsilonStart: number; // Initial exploration rate (default: 1.0)
  epsilonEnd: number; // Final exploration rate (default: 0.01)
  epsilonDecay: number; // How fast epsilon decreases (default: 0.995)

  // Training parameters
  batchSize: number; // Experiences per training step (default: 32)
  targetUpdateFreq: number; // How often to sync target network (default: 1000)
  minExperiences: number; // Min experiences before training (default: 1000)

  // Replay buffer
  replayCapacity: number; // Max experiences to store (default: 50000)
}

// Default configuration for the Agent; will be changed over time as training epochs return data
const DEFAULT_CONFIG: DQNAgentConfig = {
  epsilonStart: 1.0, // Start completely random
  epsilonEnd: 0.01, // End at 1% random (never fully deterministic)
  epsilonDecay: 0.995, // Decay ~0.5% per episode
  batchSize: 32, // Standard batch size
  targetUpdateFreq: 1000, // Sync every 1000 training steps
  minExperiences: 1000, // Wait for 1000 experiences (~5 games)
  replayCapacity: 50000, // Store ~250 games worth
};

// Training stats for monitoring progression a visual component
export interface TrainingStats {
  episode: number; // Current episode number
  epsilon: number; // Current exploration rate
  avgLoss: number; // Average training loss
  avgReward: number; // Average reward per episode
  winRate: number; // Win rate over last N episodes
  bufferSize: number; // Number of experiences stored
  trainingSteps: number; // Total training iterations
}

// DQN Agent: Core AI player object
export class DQNAgent {
  // Core components
  private model: DQNModel;
  private replay: ExperienceReplay;

  // Configuration
  private config: DQNAgentConfig;

  // Training state
  private epsilon: number; // Current exploration rate
  private episodeCount: number = 0; // Episodes trained
  private trainingSteps: number = 0; // Training iterations
  private totalReward: number = 0; // Cumulative reward this episode
  private episodeRewards: number[] = []; // Recent episode rewards
  private recentLosses: number[] = []; // Recent training losses
  private wins: number = 0; // Recent wins
  private games: number = 0; // Recent games

  constructor(config: Partial<DQNAgentConfig> = {}) {
    // Merge provided config with defaults
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize components
    this.model = new DQNModel();
    this.replay = new ExperienceReplay(this.config.replayCapacity);

    // Start with maximum exploration
    this.epsilon = this.config.epsilonStart;

    console.log("[DQNAgent] Initialized with config:", this.config);
    console.log(`[DQNAgent] Starting epsilon: ${this.epsilon.toFixed(3)}`);
  }

  // Select a valid action from the current game state using Epsilon-Greedy strategy:
  // if random() < epsilon):
  //    return random_action() <-- explore options
  // else:
  //    return best_action()   <-- exploit best option
  selectAction(state: BattleState, training: boolean = true): number {
    // Encode the game state into neural network input format
    const encodedState = encodeGameState(state, true); // true = AI perspective

    // During training: epsilon-greedy
    // During evaluation: always exploit
    const shouldExplore = training && Math.random() < this.epsilon;

    if (shouldExplore) {
      const randomAction = Math.floor(Math.random() * 68); // 0-67
      return randomAction;
    } else {
      const qValues = this.model.predict(encodedState);

      // Find action with highest Q-value
      let bestAction = 0;
      let bestQValue = qValues[0];

      for (let i = 1; i < qValues.length; i++) {
        if (qValues[i] > bestQValue) {
          bestQValue = qValues[i];
          bestAction = i;
        }
      }

      return bestAction;
    }
  }

  // After every action taken, store the experience in the replay buffer
  storeExperience(
    state: BattleState,
    action: number,
    reward: number,
    nextState: BattleState,
    done: boolean,
  ): void {
    const encodedState = encodeGameState(state, true);
    const encodedNextState = encodeGameState(nextState, true);

    this.replay.add(encodedState, action, reward, encodedNextState, done);

    // Track cumulative reward
    this.totalReward += reward;

    // If episode ended, record stats
    if (done) {
      this.episodeRewards.push(this.totalReward);
      this.totalReward = 0;

      // Track win/loss (positive final reward = win)
      this.games++;
      if (reward > 0) {
        this.wins++;
      }

      // Keep only last 100 episodes for stats
      if (this.episodeRewards.length > 100) {
        this.episodeRewards.shift();
      }
    }
  }

  // Train the agent on a batch of stored experiences
  async train(): Promise<TrainingStats | null> {
    // Don't train if not enough experiences
    if (!this.replay.canSample(this.config.minExperiences)) {
      return null;
    }

    // Sample random batch
    const batch = this.replay.sample(this.config.batchSize);

    // Train neural network
    const { loss } = await this.model.trainOnBatch(
      batch.states,
      batch.actions,
      batch.rewards,
      batch.nextStates,
      batch.dones,
    );

    // Track loss for statistics
    this.recentLosses.push(loss);
    if (this.recentLosses.length > 100) {
      this.recentLosses.shift();
    }

    // Increment training counter
    this.trainingSteps++;

    // Periodically sync target network
    if (this.trainingSteps % this.config.targetUpdateFreq === 0) {
      this.model.syncTargetNetwork();
      console.log(
        `[DQNAgent] Synced target network at step ${this.trainingSteps}`,
      );
    }

    // Decay epsilon (reduce exploration over time)
    this.decayEpsilon();

    // Return statistics
    return this.getStats();
  }

  // Decay epsilon = reducing the exploration rate
  // Floor of this value is defined by epsilonEnd
  // Actions are never fully deterministic even after training ends
  private decayEpsilon(): void {
    this.epsilon = Math.max(
      this.config.epsilonEnd,
      this.epsilon * this.config.epsilonDecay,
    );
  }

  // Get current training stats
  // Used for TrainingPanel UI component for visual indicators of training in progress
  getStats(): TrainingStats {
    const replayStats = this.replay.getStats();

    // Calculate averages
    const avgLoss =
      this.recentLosses.length > 0
        ? this.recentLosses.reduce((a, b) => a + b, 0) /
          this.recentLosses.length
        : 0;

    const avgReward =
      this.episodeRewards.length > 0
        ? this.episodeRewards.reduce((a, b) => a + b, 0) /
          this.episodeRewards.length
        : 0;

    const winRate = this.games > 0 ? this.wins / this.games : 0;

    return {
      episode: this.episodeCount,
      epsilon: this.epsilon,
      avgLoss,
      avgReward,
      winRate,
      bufferSize: replayStats.size,
      trainingSteps: this.trainingSteps,
    };
  }

  // Start new episode
  startEpisode(): void {
    this.episodeCount++;
    this.totalReward = 0;
  }

  // Reset win/loss tracking
  resetStats(): void {
    this.wins = 0;
    this.games = 0;
    this.episodeRewards = [];
    this.recentLosses = [];
  }

  // Manually override the epsilon decay
  // Needed for testing different rates of random exploration the agent might perform,
  // Or resuming traning with a specific point of epsilon
  setEpsilon(value: number): void {
    this.epsilon = Math.max(0, Math.min(1, value)); // Clamp to [0, 1]
    console.log(`[DQNAgent] Epsilon set to ${this.epsilon.toFixed(3)}`);
  }

  // Save the agent's state to project directory at root
  async save(name: string = "five-realms-dqn-agent"): Promise<void> {
    try {
      await this.model.save(name);

      this.replay.save(`${name}-replay`);

      const state = {
        epsilon: this.epsilon,
        episodeCount: this.episodeCount,
        trainingSteps: this.trainingSteps,
        wins: this.wins,
        games: this.games,
        episodeRewards: this.episodeRewards.slice(-20),
        config: this.config,
        savedAt: new Date().toISOString(),
      };

      const statePath = path.resolve(__dirname, '../../models', `${name}-state.json`);
      fs.mkdirSync(path.resolve(__dirname, '../../models'), { recursive: true });
      fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

      console.log("[DQNAgent] Saved successfully");
      console.log(
        `[DQNAgent] Episode: ${this.episodeCount}, Epsilon: ${this.epsilon.toFixed(3)}`,
      );
    } catch (error) {
      console.error("[DQNAgent] Save failed:", error);
      throw error;
    }
  }

  // Load agent state from project directory if it exists
  async load(name: string = "five-realms-dqn-agent"): Promise<boolean> {
  try {
    const modelLoaded = await this.model.load(name);
    if (!modelLoaded) {
      console.log("[DQNAgent] No saved model found");
      return false;
    }

    this.replay.load(`${name}-replay`);

    const statePath = path.resolve(__dirname, '../../models', `${name}-state.json`);
    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
      this.epsilon = state.epsilon;
      this.episodeCount = state.episodeCount;
      this.trainingSteps = state.trainingSteps;
      this.wins = state.wins;
      this.games = state.games;
      this.episodeRewards = state.episodeRewards;
      this.config = { ...this.config, ...state.config };

      console.log("[DQNAgent] Loaded successfully");
      console.log(`[DQNAgent] Episode: ${this.episodeCount}, Epsilon: ${this.epsilon.toFixed(3)}`);
      console.log(`[DQNAgent] Saved at: ${state.savedAt}`);
    }

    return true;
  } catch (error) {
    console.error("[DQNAgent] Load failed:", error);
    return false;
  }
}

  // Check if agent already exists
  async exists(name: string = "five-realms-dqn-agent"): Promise<boolean> {
    return await this.model.modelExists(name);
  }

  // Remove agent from memory
  dispose(): void {
    this.model.dispose();
    console.log("[DQNAgent] Disposed");
  }
}
