import { DQNAgent } from "./lib/ai/dqn/DQNAgent";
import { trainUniversalAgent } from "./lib/ai/dqn/AutoPlay";

async function main() {
  console.log("=== Five Realms DQN Training ===\n");

  const agent = new DQNAgent();

  // Load existing model if one exists, otherwise start fresh
  const loaded = await agent.load();
  if (loaded) {
    console.log("Resuming training from saved model...\n");
  } else {
    console.log("No saved model found, starting fresh...\n");
  }

  try {
    await trainUniversalAgent(
      agent,
      {
        episodesPerMatchup: 5000,
        deckTypes: ["fire", "earth"],
        batchSize: 50,
        maxTurnsPerGame: 50,
        opponentType: "self",
        saveEveryNBatches: 5,
      }
    );

  } catch (error) {
    console.error("Training failed:", error);
    process.exit(1);
  }

  agent.dispose();
  process.exit(0);
}

main();
