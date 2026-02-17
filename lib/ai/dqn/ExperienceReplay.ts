// Single experience tuple
// Represents a single action that the AI can take in a game session
export interface Experience {
  state: number[];        // Game state before action (121 features)
  action: number;         // Action taken (0-67)
  reward: number;         // Immediate reward received
  nextState: number[];    // Game state after action (121 features)
  done: boolean;          // Whether episode ended (game over)
}

// Batch of experiences for training
// Structure matches that of DQNModel.trainOnBatch()
export interface ExperienceBatch {
  states: number[][];       // Array of state vectors
  actions: number[];        // Array of action indices
  rewards: number[];        // Array of rewards
  nextStates: number[][];   // Array of next state vectors
  dones: boolean[];         // Array of done flags
}

// Experience Replay buffer
// Fixed size container; oldest experiences are replaced first by newest ones,
// if buffer is full. Stops old, possibly stale data from affecting weights
export class ExperienceReplay {

  private buffer: Experience[] = [];

  private maxSize: number;
  
  // Current position in the buffer (where next experience will go)
  private currentIndex: number = 0;
  
  // Whether the buffer has been filled at least once
  // Needed if the maxSize of the container can be sampled
  private isFull: boolean = false;
  
  // Create new buffer with a given maxSize
  constructor(maxSize: number = 50000) {
    this.maxSize = maxSize;
    console.log(`[ExperienceReplay] Created buffer with capacity: ${maxSize.toLocaleString()}`);
  }
  
  // Add a new experience to the buffer
  // Circular buffer: if buffer isn't full, add to the next available index
  // If it is full, overwrite the oldest experience in the buffer
  add(
    state: number[],
    action: number,
    reward: number,
    nextState: number[],
    done: boolean
  ): void {
    const experience: Experience = {
      state,
      action,
      reward,
      nextState,
      done,
    };
    
    // If buffer isn't full yet, keep adding
    if (this.buffer.length < this.maxSize) {
      this.buffer.push(experience);
    } else {
      // Buffer is full, overwrite oldest experience
      this.buffer[this.currentIndex] = experience;
      this.isFull = true;
    }
    
    // Move to next position, wrap around if needed
    this.currentIndex = (this.currentIndex + 1) % this.maxSize;
  }
  
  // Sample a random batch of experiences for training
  sample(batchSize: number = 32): ExperienceBatch {
    
    const sampleSize = Math.min(batchSize, this.size());
    
    if (sampleSize === 0) {
      throw new Error('[ExperienceReplay] Cannot sample from empty buffer');
    }
    
    // Randomly select indices to sample from
    const indices = this.sampleIndices(sampleSize);
    
    // Take experiences at the sampled indices
    const experiences = indices.map(i => this.buffer[i]);
    
    // Organize into the format expected by DQNModel.trainOnBatch()
    return {
      states: experiences.map(e => e.state),
      actions: experiences.map(e => e.action),
      rewards: experiences.map(e => e.reward),
      nextStates: experiences.map(e => e.nextState),
      dones: experiences.map(e => e.done),
    };
  }
  
  // Return a random sample of experinces to the sample function above
  // Similar to how the game shuffles decks, uses Fisher-Yates algorithm
  private sampleIndices(count: number): number[] {
    const size = this.size();
    
    // Create array of all valid indices
    const indices = Array.from({ length: size }, (_, i) => i);
    
    // Partially shuffle: only shuffle the first `count` elements
    for (let i = 0; i < count; i++) {
      // Pick random index from remaining unshuffled portion
      const randomIndex = i + Math.floor(Math.random() * (size - i));
      
      // Swap current element with randomly selected element
      [indices[i], indices[randomIndex]] = [indices[randomIndex], indices[i]];
    }
    
    // Return the shuffled portion
    return indices.slice(0, count);
  }
  
  // Return number of experiences currently in the buffer
  size(): number {
    return this.buffer.length;
  }
  
  // Check if buffer has enough experiences to train an agent on
  // Used if only a few experiences are need for debugging/UX testing
  canSample(minSize: number = 1000): boolean {
    return this.size() >= minSize;
  }

  // Clear all experiences from the buffer
  // ONLY to be used when training needs to be completely reset
  clear(): void {
    this.buffer = [];
    this.currentIndex = 0;
    this.isFull = false;
    console.log('[ExperienceReplay] Buffer cleared');
  }
  
  // For debugging: get stats on current training at any point
  getStats(): {
    size: number;
    capacity: number;
    utilization: number;
    isFull: boolean;
    averageReward: number;
    positiveRewards: number;
    negativeRewards: number;
  } {
    const size = this.size();
    
    // Calculate reward statistics
    const rewards = this.buffer.map(e => e.reward);
    const totalReward = rewards.reduce((sum, r) => sum + r, 0);
    const averageReward = size > 0 ? totalReward / size : 0;
    const positiveRewards = rewards.filter(r => r > 0).length;
    const negativeRewards = rewards.filter(r => r < 0).length;
    
    return {
      size,
      capacity: this.maxSize,
      utilization: size / this.maxSize,
      isFull: this.isFull,
      averageReward,
      positiveRewards,
      negativeRewards,
    };
  }
  
  // Save current buffer to local storage
  save(key: string = 'five-realms-replay-buffer', maxToSave: number = 5000): void {
    try {
      // Only save most recent experiences to fit in localStorage
      const recentExperiences = this.buffer.slice(-maxToSave);
      
      const data = {
        experiences: recentExperiences,
        maxSize: this.maxSize,
        savedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`[ExperienceReplay] Saved ${recentExperiences.length} experiences to localStorage`);
    } catch (error) {
      console.error('[ExperienceReplay] Failed to save buffer:', error);
    }
  }
  
  // Load buffer from local storage
  load(key: string = 'five-realms-replay-buffer'): boolean {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        console.log('[ExperienceReplay] No saved buffer found');
        return false;
      }
      
      const data = JSON.parse(stored);
      
      // Restore experiences
      this.buffer = data.experiences;
      this.currentIndex = this.buffer.length % this.maxSize;
      this.isFull = this.buffer.length >= this.maxSize;
      
      console.log(`[ExperienceReplay] Loaded ${this.buffer.length} experiences from localStorage`);
      console.log(`[ExperienceReplay] Buffer saved at: ${data.savedAt}`);
      
      return true;
    } catch (error) {
      console.error('[ExperienceReplay] Failed to load buffer:', error);
      return false;
    }
  }
}