// Using tensors in this file instead of regular arrays. TensorFlow.js requires them,
// And neural network operations are much faster on tensors than on regular containers.
// Tensors give me access to .predict() and .fit() for training.
// .predict() = the forward pass; return Q-values for a given prediction
// .fit() = the backpropagation; adjust the weights to minimize the error between the prediction made and the target

import * as tf from "@tensorflow/tfjs";

export class DQNModel {
  // The neural network model
  private model: tf.LayersModel;

  // Target network for stable learning
  private targetModel: tf.LayersModel;

  // Input size: from stateEncoder.ts (121 features)
  private readonly STATE_SIZE = 121;

  // Output size: number of possible actions (68 total)
  private readonly ACTION_SIZE = 68;

  // Hyperparameters
  private readonly LEARNING_RATE = 0.0001; // how fast the network learns
  private readonly DISCOUNT_FACTOR = 0.99; // how much future rewards are valued

  constructor() {
    console.log("[DQN] Initializing model...");

    this.model = this.buildModel();

    this.targetModel = this.buildModel();

    this.syncTargetNetwork();

    console.log("[DQN] Model initialized.");
    console.log(
      `[DQN] State size: ${this.STATE_SIZE}, Action size: ${this.ACTION_SIZE}`,
    );
  }

  // Neural network architecture:
  // Feed forward neural network with 3 hidden layers (128, 128, 64 neurons) and ReLU activations
  private buildModel(): tf.LayersModel {
    const model = tf.sequential(); // Sequential model, layers are in order (input -> hidden -> output)

    // Input layer first hidden layer
    // Takes 121 state features, outputs 128 features, uses ReLU activation, and He initialization for better training performance
    model.add(
      tf.layers.dense({
        inputShape: [this.STATE_SIZE],
        units: 128,
        activation: "relu",
        kernelInitializer: "heNormal", // He initialization for better convergence
      }),
    );

    // Second hidden layer
    // Takes 128 inputs, outputs 128 activations
    model.add(
      tf.layers.dense({
        units: 128,
        activation: "relu",
        kernelInitializer: "heNormal",
      }),
    );

    // Third hidden layer
    model.add(
      tf.layers.dense({
        units: 64,
        activation: "relu",
        kernelInitializer: "heNormal",
      }),
    );

    // Output layer
    // Takes 64 inputs, outputs 68 Q-values (one for each possible action)
    model.add(
      tf.layers.dense({
        units: this.ACTION_SIZE,
        activation: "linear", // No activation here: raw Q-values for each action
        kernelInitializer: "glorotUniform", // Xavier initialization for output layer
      }),
    );

    // Compile the model with mean squared error loss and Adam optimizer
    model.compile({
      optimizer: tf.train.adam(this.LEARNING_RATE), // Adam optimizer - adaptive learning
      loss: "meanSquaredError", // MSE loss for regression on Q-values  (predictedQ - targetQ)^2
      metrics: ["mae"], // Mean Absolute Error for monitoring training progress
    });

    return model;
  }

  // Predict Q-values for a given state using the current model
  // Return an array of Q-values corresponding to each possible action
  predict(state: number[]): Float32Array {
    return tf.tidy(() => {
      // Convert state array to tensor: [121] -> [1, 121] for batch processing
      // The 1 is the batch size (predict one state at a time)
      const stateTensor = tf.tensor2d([state], [1, this.STATE_SIZE]);

      // Run forward pass through the network
      const qValues = this.model.predict(stateTensor) as tf.Tensor;

      // Convert tensor back to JavaScript array
      return qValues.dataSync() as Float32Array;
    });
  }

  // Predict Q-values using the target network (used for stable learning)
  // This is used during training to calculate target Q-values without affecting the current model's predictions
  predictTarget(state: number[]): Float32Array {
    return tf.tidy(() => {
      const stateTensor = tf.tensor2d([state], [1, this.STATE_SIZE]);
      const qValues = this.targetModel.predict(stateTensor) as tf.Tensor;
      return qValues.dataSync() as Float32Array;
    });
  }

  // Train on a batch of experiences from the replay buffer
  async trainOnBatch(
    states: number[][], // Array of state vectors
    actions: number[], // Array of action indices taken
    rewards: number[], // Array of rewards received
    nextStates: number[][], // Array of next state vectors after taking actions
    dones: boolean[], // Array indicating if the episode ended after each action
  ): Promise<{ loss: number; mae: number }> {
    const batchSize = states.length;

    // Prep the training data inside of tf.tidy() for memory cleanup
    // Tensors don't automatically free up memory, do dispose() is required
    const { statesTensor, targetQsTensor } = tf.tidy(() => {

      // Convert state arrays into tensors
      // Shape: [batchSize, 121], each row in the tensor is one game state
      const statesTensor = tf.tensor2d(states, [batchSize, this.STATE_SIZE]);

      // Get current Q-value predictions for all actions in each state
      // Shape: [batchSize, 68], each row in the tensor has all 68 Qs
      const currentQs = this.model.predict(statesTensor) as tf.Tensor2D;

      // Convert next states into tensors
      const nextStatesTensor = tf.tensor2d(nextStates, [
        batchSize,
        this.STATE_SIZE,
      ]);

      // Get Q-value predictions for next states using the Target network
      // Secondary network with target values provides stability during training;
      // Targets get updated periodically to improve the accuracy of predictions over time
      const nextQs = this.targetModel.predict(nextStatesTensor) as tf.Tensor2D;

      // Convert tensors back into arrays (easier to manipulate)
      const currentQsArray = currentQs.arraySync() as number[][];
      const nextQsArray = nextQs.arraySync() as number[][];

      // Build target Q-values using Bellman equation
      const targetQs = currentQsArray.map((qValues, index) => {
        const targetQ = [...qValues];

        // If episode has ended, Target Q-value is just immediate reward since no future rewards are possible
        // Else, Target Q-value = immediate reward + best future reward
        if (dones[index]) {
          targetQ[actions[index]] = rewards[index];
        } else {
          const maxNextQ = Math.max(...nextQsArray[index]);
          targetQ[actions[index]] =
            rewards[index] + this.DISCOUNT_FACTOR * maxNextQ;
        }

        return targetQ;
      });

      // Convert target Qs back to tensors
      const targetQsTensor = tf.tensor2d(targetQs, [
        batchSize,
        this.ACTION_SIZE,
      ]);

      // Prevent tf.tidy from disposing the tensors that need to stay active in memory
      return {
        statesTensor: tf.keep(statesTensor),
        targetQsTensor: tf.keep(targetQsTensor),
      };
    });

    try {
      // Train the network using fit() function
      const history = await this.model.fit(statesTensor, targetQsTensor, {
        epochs: 1,
        verbose: 0,
        batchSize: batchSize,
      });

      const loss = history.history.loss[0] as number;   // Wrongness of predictions made
      const mae = history.history.mae[0] as number;     // Mean absolute error

      return { loss, mae };
    } finally {
        // Memory clean up
      statesTensor.dispose();
      targetQsTensor.dispose();
    }
  }

  // Sync the target network with the current model (copy weights)
  // This is done every few training steps to stabilize learning
  syncTargetNetwork(): void {
    const weights = this.model.getWeights();
    this.targetModel.setWeights(weights);
    console.log("[DQN] Target network synced with current model.");
  }

  // Save model to browser's local storage (for persistence across sessions)
  async save(name: string = "five-realms-dqn"): Promise<void> {
    try {
      await this.model.save(`localstorage://${name}`);
      console.log(`[DQN] Model saved to localStorage as '${name}'`);
    } catch (error) {
      console.error("[DQN] Failed to save model:", error);
      throw error;
    }
  }

  // Load model from browser's local storage
  // Returns true if loading was successful, false otherwise
  async load(name: string = "five-realms-dqn"): Promise<boolean> {
    try {
      // Dispose old model before loading new one
      if (this.model) {
        this.model.dispose();
      }
      if (this.targetModel) {
        this.targetModel.dispose();
      }

      this.model = await tf.loadLayersModel(`localstorage://${name}`);

      // Need to recompile after loading
      this.model.compile({
        optimizer: tf.train.adam(this.LEARNING_RATE),
        loss: "meanSquaredError",
        metrics: ["mae"],
      });

      // Also sync the target network
      this.syncTargetNetwork();
      console.log(`[DQN] Model loaded from localStorage: '${name}'`);
      return true;
    } catch (error) {
      console.warn(
        "[DQN] Failed to load model (this is normal if no model exists yet):",
        error,
      );
      return false;
    }
  }

  // Check if a saved model exists in local storage
  async modelExists(name: string = "five-realms-dqn"): Promise<boolean> {
    try {
      const models = await tf.io.listModels();
      return Object.keys(models).includes(`localstorage://${name}`);
    } catch {
      return false;
    }
  }

  // Get model summary for debugging purposes
  printSummary(): void {
    this.model.summary();
  }

  // Dispose of model to free up memory
  dispose(): void {
    this.model.dispose();
    this.targetModel.dispose();
    console.log("[DQN] Model disposed");
  }
}
