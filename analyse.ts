import fs from "fs";
import path from "path";

const REPLAY_PATH = path.resolve(process.cwd(), "models", "five-realms-dqn-agent-replay.json");
const STATE_PATH = path.resolve(process.cwd(), "models", "five-realms-dqn-agent-state.json");

interface Experience 
{
  state: number[];
  action: number;
  reward: number;
  nextState: number[];
  done: boolean;
}

function analyse() {
  const replayData = JSON.parse(fs.readFileSync(REPLAY_PATH, "utf-8"));
  const stateData = JSON.parse(fs.readFileSync(STATE_PATH, "utf-8"));
  const experience: Experience[] = replayData.experiences;

  console.log("\n========================================");
  console.log("  Five Realms — Replay Buffer Analysis");
  console.log("========================================");
  console.log(`  Saved at:     ${replayData.savedAt}`);
  console.log(`  Experiences:  ${experience.length}`);
  console.log(`  Episodes:     ${stateData.episodeCount}`);
  console.log(`  Epsilon:      ${stateData.epsilon}`);
  console.log("========================================\n");

  // 1. Action Distribution
  // Count how many times each action was taken across all experiences, and the average reward for each action type
  // This can reveal if the agent is favoring certain actions, and whether those actions are generally leading to positive or negative outcomes
  // Action mapping (based on DQNAgent.getLegalActions):
  // 0-9: play card in hand slot 0-9
  // 10-59: attack with minion i (0-6) to target j (0-6 for minions, 7 for face)
  // 60-66: attack face with minion i (0-6)
  // 67: end turn
  const totalActions = 
  {
    playCard: 0,
    attackMinion: 0,
    attackFace: 0,
    endTurn: 0,
  };
  const actionRewards = 
  {
    playCard: 0,
    attackMinion: 0,
    attackFace: 0,
    endTurn: 0,
  };

  for (const exp of experience) 
    {
        if (exp.action <= 9) 
        {
            totalActions.playCard++;
            actionRewards.playCard += exp.reward;
        } 
        else if (exp.action <= 59) 
        {
            totalActions.attackMinion++;
            actionRewards.attackMinion += exp.reward;
        } 
        else if (exp.action <= 66) 
        {
            totalActions.attackFace++;
            actionRewards.attackFace += exp.reward;
        } 
        else 
        {        
            totalActions.endTurn++;
            actionRewards.endTurn += exp.reward;
        }
    }

  console.log("-- 1. Action Distribution --------------");
  for (const [key, count] of Object.entries(totalActions)) {

    const percentageCompletion = ((count / experience.length) * 100).toFixed(1);

    const avgReward = count > 0 ? (actionRewards[key as keyof typeof actionRewards] / count).toFixed(3) : "0.000";

    console.log(`  ${key.padEnd(14)} ${String(count).padStart(5)}  (${percentageCompletion.padStart(5)}%)  avg reward: ${avgReward.padStart(7)}  `);
  }

  // 2. Reward Distribution
  // Analyze the distribution of rewards across all experiences, and how many were positive/negative/zero
  // This can give insight into how often the agent is receiving feedback, and whether it's mostly learning from wins, losses, or neutral outcomes
  // Since wins are +10 and losses are -10, a good average reward to see here at low epsilon would be roughly between 0 and +1,
  // showing the agent is learning to win more often than lose, but still has a lot of room for improvement
  const rewards = experience.map((e) => e.reward);
  const avgReward = rewards.reduce((a, b) => a + b, 0) / rewards.length;
  const posCount = rewards.filter((r) => r > 0).length;
  const negCount = rewards.filter((r) => r < 0).length;
  const zeroCount = rewards.filter((r) => r === 0).length;

  console.log("\n-- 2. Reward Distribution --------------");
  console.log(`  Average reward:   ${avgReward.toFixed(3)}`);
  console.log(`  Positive rewards: ${posCount} (${((posCount / experience.length) * 100).toFixed(1)}%)`);
  console.log(`  Negative rewards: ${negCount} (${((negCount / experience.length) * 100).toFixed(1)}%)`);
  console.log(`  Zero rewards:     ${zeroCount} (${((zeroCount / experience.length) * 100).toFixed(1)}%)`);

  // 3. Terminal States
  // Count how many experiences ended in terminal states (done=true), and how many of those were wins/losses/draws
  // A win is reward > 0, loss is reward < 0, draw is reward = 0 (can happen if game ends due to turn limit)
  const terminals = experience.filter((e) => e.done);
  const termWins = terminals.filter((e) => e.reward > 0).length;
  const termLoss = terminals.filter((e) => e.reward < 0).length;
  const termDraw = terminals.filter((e) => e.reward === 0).length;

  console.log("\n-- 3. Terminal States --------------");
  console.log(`  Total terminals:  ${terminals.length}`);
  console.log(`  Wins  (+10):      ${termWins}  (${terminals.length > 0 ? ((termWins / terminals.length) * 100).toFixed(1) : 0}%)`);
  console.log(`  Losses (-10):     ${termLoss}  (${terminals.length > 0 ? ((termLoss / terminals.length) * 100).toFixed(1) : 0}%)`);
  console.log(`  Draws  (0):       ${termDraw}  (${terminals.length > 0 ? ((termDraw / terminals.length) * 100).toFixed(1) : 0}%)`);

  // 4. Mana Efficiency
  // state[1] = player mana /10, action 67 = end turn
  // Count how many times the agent ended its turn with unspent mana, and how much on average
  const endTurnExps = experience.filter((e) => e.action === 67);
  const manaWasted = endTurnExps.filter((e) => e.state[1] > 0);
  const fullManaWasted = endTurnExps.filter((e) => e.state[1] >= 0.99); // full 10 mana unspent

  console.log("\n-- 4. Mana Efficiency --------------");
  console.log(`  End turn actions:        ${endTurnExps.length}`);
  console.log(`  With mana wasted:        ${manaWasted.length} (${endTurnExps.length > 0 ? ((manaWasted.length / endTurnExps.length) * 100).toFixed(1) : 0}%)`);
  console.log(`  Full 10 mana unspent:    ${fullManaWasted.length}`);

  // 5. Board State at Decision Time
  // state[49 + i*5] = opponent minion i mana cost /10 (0 if no minion)
  // state[84 + i*5] = player minion i mana cost /10 (0 if no minion)
  // Count how many minions were on board for both sides at the time of each action, and average it out
  const avgAIBoardSize =
    experience.reduce((sum, gameExperience) => {
      let count = 0;
      for (let i = 0; i < 7; i++) {
        if (gameExperience.state[49 + i * 5] > 0) count++;
      }
      return sum + count;
    }, 0) / experience.length;

  const avgOppBoardSize =
    experience.reduce((sum, currentExperience) => {
      let count = 0;
      for (let i = 0; i < 7; i++) {
        if (currentExperience.state[84 + i * 5] > 0) count++;
      }
      return sum + count;
    }, 0) / experience.length;

  console.log("\n-- 5. Average Board State --------------");
  console.log(`  AI board size:        ${avgAIBoardSize.toFixed(2)} minions`);
  console.log(`  Opponent board size:  ${avgOppBoardSize.toFixed(2)} minions`);
  console.log(`  Board advantage:      ${(avgAIBoardSize - avgOppBoardSize).toFixed(2)}`);

  // 6. Health State at Decision Time
  // state[0] = AI health /30, state[3] = opponent health /30
  // Analyze the average health of both sides at the time of each action, and how many times the agent made decisions at critical health levels (e.g. <=10 hp)
  const avgAIHealth = experience.reduce( (sum, currentExperience) => sum + currentExperience.state[0] * 30, 0, ) / experience.length;
  const avgOppHealth = experience.reduce( (sum, currentExperience) => sum + currentExperience.state[3] * 30, 0, ) / experience.length;
  const criticalHealth = experience.filter( (currentExperience) => currentExperience.state[0] * 30 <= 10, ).length;

  console.log("\n-- 6. Health State --------------");
  console.log(`  Avg AI health:       ${avgAIHealth.toFixed(1)}`);
  console.log(`  Avg opponent health: ${avgOppHealth.toFixed(1)}`);
  console.log(
    `  Decisions at <=10 hp: ${criticalHealth} (${((criticalHealth / experience.length) * 100).toFixed(1)}%)`,
  );

  console.log("\n========================================\n");
}

analyse();
