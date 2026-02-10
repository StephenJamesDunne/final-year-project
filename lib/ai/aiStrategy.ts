import { BattleState } from "../types/game";
import { AIAction, getAIAction } from "../game/aiPlayer";

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

// DQN AI stub, will be replaced later after testing all this
export class DQNAgent implements AIStrategy {
    name = "DQN Agent";
    private fallbackAI: RuleBasedAI;

    constructor() {
        this.fallbackAI = new RuleBasedAI();
    }

    selectAction(state: BattleState): AIAction {
        // For now, just use the rule-based AI as a placeholder
        // In the future, this will use the DQN model to select an action
        return this.fallbackAI.selectAction(state);
    }
    
    onGameEnd(state: BattleState, won: boolean): void {
        // Placeholder for future training logic
        console.log('[DQN] Game ended, won: ', won);
    }
}

// AI Factory; easy switching between rule-based and DQN
export type AIType = "rule-based" | "dqn";

export function createAI(type: AIType): AIStrategy {
    switch (type) {
        case "rule-based":
            return new RuleBasedAI();
        case "dqn":
            return new DQNAgent();
        default:
            return new RuleBasedAI();
    }
}
