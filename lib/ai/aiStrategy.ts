import { BattleState } from "../types/game";
import { AIAction, getAIAction } from "../game/aiPlayer";
import { encodeGameState } from "./dqn/stateEncoder";
import { getLegalActions } from "./dqn/ActionSpace";
import { DQNModelBrowser } from "./dqn/DQNModelBrowser";
import { AgentDebugData } from "../store/slices/battleSlice";
import { useBattleStore } from "../store/battleStore";

// Interface that all AI implementations must follow
// This allows swapping between rule-based and DQN seamlessly
export interface AIStrategy {
  name: string;
  selectAction(state: BattleState): AIAction;
  onGameEnd?(state: BattleState, won: boolean): void;
}

// Rule-Based AI
export class RuleBasedAI implements AIStrategy {
  name = "Rule-Based AI";

  selectAction(state: BattleState): AIAction {
    return getAIAction(state.ai, state);
  }
}

// DQN AI - delegates to the real trained model in lib/ai/dqn/DQNAgent.ts
// Falls back to rule-based AI while the model is loading, or if no saved model exists
export class DQNStrategy implements AIStrategy {
  private fallbackAI: RuleBasedAI;

  // Loads a browser-safe class to get the trained model
  private dqnModel: DQNModelBrowser | null = null;

  private ready: boolean = false;

  // True if a saved model was found and loaded successfully; false if no model found (will use fallback AI)
  private modelFound: boolean = false;

  // Container for all logged actions for the debug overlay; only for the AI agent's chosen actions
  // During each of its turns. For showcase use only
  private turnActionLog: string[] = [];

  constructor() {
    this.fallbackAI = new RuleBasedAI();
    this.loadModel();
  }

  // Dynamically import DQNAgent to keep fs/path out of the client bundle,
  // then attempt to laod a saved model
  private async loadModel(): Promise<void> {
    try {
      const { DQNModelBrowser } = await import("./dqn/DQNModelBrowser");
      this.dqnModel = new DQNModelBrowser();

      const loaded = await this.dqnModel.load();
      if (loaded) {
        this.ready = true;
        console.log(
          "[DQNStrategy] Model loaded successfully: using trained policy",
        );
      } else {
        this.modelFound = false;
        console.log(
          "[DQNStrategy] No saved model found: using fallback rule-based AI",
        );
      }
    } catch (error) {
      this.modelFound = false;
      console.error("[DQNStrategy] Failed to load model:", error);
    }
  }

  // Expose loading state for UI (for deck selection screen tooltip)
  get status(): "loading" | "ready" | "fallback" {
    if (this.ready) return "ready";
    if (this.modelFound) return "fallback";
    return "loading";
  }

  // Display different name based on loading state for UI feedback
  get name(): string {
    switch (this.status) {
      case "loading":
        return "DQN Agent (Loading...)";
      case "ready":
        return "DQN Agent";
      case "fallback":
        return "DQN Agent (No Model Found, Using Rule-Based Fallback)";
    }
  }

  // Use the trained model if it's ready, otherwise fall back to the rule-based AI until it is
  // If the trained model has usable weights, this function encodes the game state to readable inputs
  // for the neural network. It then foes forward passes using the trained weights instead of the changeable
  // values during a training session. No back prop happens here because training is done
  selectAction(state: BattleState): AIAction {
    if (!this.ready) {
      return this.fallbackAI.selectAction(state);
    }

    const encoded = encodeGameState(state, true);

    // ! non-null assertion operator used just below here: dqnModel can't be null at this point, if this.ready is true
    // directly above it
    const qValues = this.dqnModel!.predict(encoded);
    const legalActions = new Set(getLegalActions(state, true));

    let bestAction = -1;
    let bestQValue = -Infinity;

    for (let i = 0; i < qValues.length; i++) {
      if (legalActions.has(i) && qValues[i] > bestQValue) {
        bestQValue = qValues[i];
        bestAction = i;
      }
    }

    if (bestAction === -1) {
      bestAction = 67;
    }

    // Pull in the Zustand store to update the debug data with the current Q-values and action descriptions
    const store = useBattleStore.getState();

    // Output debug data if debug mode is enabled in the battle store
    if (store.debugMode) {
      const ranked = Array.from(legalActions)
        .map((i) => ({
          index: i,
          description: describeActionIndex(i, state),
          qValue: qValues[i],
        }))
        .sort((a, b) => b.qValue - a.qValue)
        .slice(0, 5);

      if (bestAction === 67) {
        // End turn — persist last meaningful Q-values, save turn log
        store.setLastTurnActions([...this.turnActionLog]);
        this.turnActionLog = [];

        // Update the hand in the existing debug data to reflect what the AI ended with
        const current = store.agentDebugData;
        if (current) {
          store.setAgentDebugData({
            ...current,
            aiHand: state.ai.hand,
            nextDraw: state.ai.deck[0] ?? null,
          });
        }
      } else {
        // Meaningful action — update Q-values and append to turn log
        const debugData: AgentDebugData = {
          topActions: ranked,
          chosenAction: {
            index: bestAction,
            description: describeActionIndex(bestAction, state),
            qValue: qValues[bestAction],
          },
          aiHand: state.ai.hand,
          nextDraw: state.ai.deck[0] ?? null,
        };

        store.setAgentDebugData(debugData);
        this.turnActionLog.push(describeActionIndex(bestAction, state));

        console.log("[DQN] Top actions:");
        for (const action of ranked) {
          console.log(
            `  [${action.index}] ${action.description} -> Q: ${action.qValue.toFixed(3)}`,
          );
        }
        console.log(
          `  -> Chose: [${bestAction}] ${debugData.chosenAction.description}`,
        );
      }
    }

    // The returned action then needs to be converted back to the AIAction format
    // turnSlice and executeAIPlayCard both expect a full AIAction object
    return indexToAction(bestAction, state);
  }

  onGameEnd(state: BattleState, won: boolean): void {
    // Not training during gameplay - no need to store experiences or update the model in real time, so this is just for logging purposes
    console.log(`[DQNStrategy] Game ended, result: ${won ? "win" : "loss"}`);
  }
}

// Convert a DQN action index (0-67) into a full AIAction object that can be executed in the game
// Mirrors the ActionSpace decoding logic in lib/ai/dqn/ActionSpace.ts, but also fills in any additional details needed for the AIAction format
// turnSlice and aiPlayer.ts use instanceIds rather than board indices
function indexToAction(actionIndex: number, state: BattleState): AIAction {
  // End turn (67)
  if (actionIndex === 67) {
    return { type: "pass" };
  }

  // Play card (0-9)
  if (actionIndex >= 0 && actionIndex <= 9) {
    return {
      type: "play_card",
      cardIndex: actionIndex,
    };
  }

  // Attack face (60-66): attacker board index → instanceId
  if (actionIndex >= 60 && actionIndex <= 66) {
    const attackerIndex = actionIndex - 60;
    const attacker = state.ai.board[attackerIndex];

    if (!attacker) {
      console.warn(
        `[DQNStrategy] attack_face: no minion at board index ${attackerIndex}, falling back to pass`,
      );
      return { type: "pass" };
    }

    return {
      type: "attack",
      attackerId: attacker.instanceId,
      targetId: "face",
    };
  }

  // Attack minion (10-59): decode attacker + target board indices → instanceIds
  if (actionIndex >= 10 && actionIndex <= 59) {
    const offset = actionIndex - 10;
    const attackerIndex = Math.floor(offset / 7);
    const targetIndex = offset % 7;

    const attacker = state.ai.board[attackerIndex];
    const target = state.player.board[targetIndex];

    if (!attacker || !target) {
      console.warn(
        `[DQNStrategy] attack_minion: invalid indices attacker=${attackerIndex} target=${targetIndex}, falling back to pass`,
      );
      return { type: "pass" };
    }

    return {
      type: "attack",
      attackerId: attacker.instanceId,
      targetId: target.instanceId,
    };
  }

  // Default fallback action
  return { type: "pass" };
}

function describeActionIndex(index: number, state: BattleState): string {
  if (index === 67) return "End Turn";
  if (index >= 0 && index <= 9) {
    const card = state.ai.hand[index];
    return card
      ? `Play ${card.name} (${card.manaCost} mana)`
      : `Play card [${index}]`;
  }
  if (index >= 60 && index <= 66) {
    const attacker = state.ai.board[index - 60];
    return attacker
      ? `Attack face with ${attacker.name}`
      : `Attack face [${index}]`;
  }
  if (index >= 10 && index <= 59) {
    const offset = index - 10;
    const attacker = state.ai.board[Math.floor(offset / 7)];
    const target = state.player.board[offset % 7];
    return attacker && target
      ? `${attacker.name} attacks ${target.name}`
      : `Attack minion [${index}]`;
  }
  return `Unknown [${index}]`;
}

export type AIType = "rule-based" | "dqn";

export function createAI(type: AIType): AIStrategy {
  switch (type) {
    case "rule-based":
      return new RuleBasedAI();
    case "dqn":
      return new DQNStrategy();
    default:
      return new RuleBasedAI();
  }
}
