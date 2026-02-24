import { BattleState } from "../types/game";
import { AIAction, getAIAction } from "../game/aiPlayer";
import { DQNAgent as ActualDQNAgent } from "./dqn/DQNAgent";

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
    private dqnAgent: ActualDQNAgent;

    private ready: boolean = false;

    // True if a saved model was found and loaded successfully; false if no model found (will use fallback AI)
    private modelFound: boolean = false;

    constructor() {
        this.dqnAgent = new ActualDQNAgent();
        this.fallbackAI = new RuleBasedAI();
        this.loadModel();
    }

    // Start async model loading. selectAction() will use the fallback until this resolves
    private async loadModel(): Promise<void> {
        try {
            const loaded = await this.dqnAgent.load();
            if (loaded) { 
                this.ready = true;
                console.log("[DQNStrategy] Model loaded successfully: using trained policy");
            } else {
                this.modelFound = true;
                console.log("[DQNStrategy] No saved model found: using fallback rule-based AI");
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
            case "loading": return "DQN Agent (Loading...)";
            case "ready": return "DQN Agent";
            case "fallback": return "DQN Agent (No Model Found, Using Rule-Based Fallback)";
        }
    }

    // Use the trained model if it's ready, otherwise fall back to the rule-based AI until it is
    selectAction(state: BattleState): AIAction {
        if (!this.ready) {
            return this.fallbackAI.selectAction(state);
        }

        // DQNAgent returns an action index (0-67):
        const actionIndex = this.dqnAgent.selectAction(state, false);

       // The returned action then needs to be converted back to the AIAction format
       // turnSlice and executeAIPlayCard both expect a full AIAction object
        return indexToAction(actionIndex, state);
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
            console.warn(`[DQNStrategy] attack_face: no minion at board index ${attackerIndex}, falling back to pass`);
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
        const offset        = actionIndex - 10;
        const attackerIndex = Math.floor(offset / 7);
        const targetIndex   = offset % 7;

        const attacker = state.ai.board[attackerIndex];
        const target   = state.player.board[targetIndex];

        if (!attacker || !target) {
            console.warn(`[DQNStrategy] attack_minion: invalid indices attacker=${attackerIndex} target=${targetIndex}, falling back to pass`);
            return { type: "pass" };
        }

        return {
            type: "attack",
            attackerId: attacker.instanceId,
            targetId:   target.instanceId,
        };
    }

    // Default fallback action
    return { type: "pass" }; 
}

// AI Factory; easy switching between rule-based and DQN
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
