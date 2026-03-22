// DQNModelBrowser - Browser-safe model loader for DQN inference
// Counterpart to DQNModel.ts, which is Node.js only (training)
//
// Responsibilities:
// - Fetch trained weights from public/models/
// - Load weights into the same network architecture used during training
// - Use predict() for running forward passes during gameplay
//
// This file deliberately has no fs/path imports - weights are loaded
// via fetch() instead, making it safe to run in the browser.
//
// Training is handled entirely separately in Node.js
// DQNModel.ts -> saves weights to public/models/
// DQNModelBrowser.ts -> fetches those weights for inference
//
// Used by DQNStrategy in aiStrategy.ts to select actions during a game

import * as tf from '@tensorflow/tfjs';

export class DQNModelBrowser {
  private model: tf.LayersModel | null = null;
  private readonly STATE_SIZE = 121;
  private readonly ACTION_SIZE = 68;

  async load(name: string = "five-realms-dqn-agent"): Promise<boolean> {
    try {
      const response = await fetch(`/models/${name}/weights.json`);
      if (!response.ok) return false;

      const weightData = await response.json();
      
      // Rebuild the model architecture (same as DQNModel.buildModel)
      this.model = this.buildModel();
      
      // Restore weights
      const weights = weightData.map((w: { shape: number[]; data: number[] }) =>
        tf.tensor(w.data, w.shape)
      );
      this.model.setWeights(weights);
      weights.forEach((w: tf.Tensor) => w.dispose());

      console.log('[DQNModelBrowser] Weights loaded successfully');
      return true;
    } catch (error) {
      console.warn('[DQNModelBrowser] Failed to load weights:', error);
      return false;
    }
  }

  predict(state: number[]): Float32Array {
    if (!this.model) throw new Error('Model not loaded');
    
    return tf.tidy(() => {
      const stateTensor = tf.tensor2d([state], [1, this.STATE_SIZE]);
      const qValues = this.model!.predict(stateTensor) as tf.Tensor;
      return qValues.dataSync() as Float32Array;
    });
  }

  private buildModel(): tf.LayersModel {
    // Identical architecture to DQNModel.buildModel()
    const model = tf.sequential();
    model.add(tf.layers.dense({
      inputShape: [this.STATE_SIZE],
      units: 128,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    }));
    model.add(tf.layers.dense({ units: 128, activation: 'relu', kernelInitializer: 'heNormal' }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu', kernelInitializer: 'heNormal' }));
    model.add(tf.layers.dense({ units: this.ACTION_SIZE, activation: 'linear' }));
    model.compile({ optimizer: tf.train.adam(0.00001), loss: 'meanSquaredError' });
    return model;
  }

  dispose(): void {
    this.model?.dispose();
  }
}