import { StateCreator } from "zustand";
import { DeckSlice } from "./deckSlice";
import { BattleSlice } from "./battleSlice";
import { BattleState } from "../../types/game";
import { executeAIPlayCard } from "@/lib/game/aiPlayer";
import {
  checkGameOver,
  startTurn,
  incrementTurnNumber,
  handleMinionCombat,
  updateBoardAfterCombat,
} from "@/lib/game/gameLogic";
import { AIStrategy } from "@/lib/ai/aiStrategy";

// FSM states for the AI turn
// Each state represents a different phase in the AI's turn
type AITurnState =
  | "thinking" // Simulating a "thinking" phase that pauses before actions are taken
  | "playing_card" // AI chose to play a card
  | "attacking" // AI chose to attack with a minion
  | "ending_turn"; // AI chose to pass/end turn

// interface for the turn slice of the Zustand store; manages turn progression and AI actions during the AI's turn
export interface TurnSlice {
  aiTurnState: AITurnState | null; // null when it's the player's turn
  endTurn: () => Promise<void>;
}

export const createTurnSlice: StateCreator<
  TurnSlice & BattleSlice & DeckSlice,
  [],
  [],
  TurnSlice
> = (set, get) => ({
  aiTurnState: null,

  endTurn: async () => {
    // get the current state of the game make sure it's the player's turn
    const state = get();
    if (state.currentTurn !== "player" || state.gameOver) return;

    // Get AI Strategy; works for both rule-based and DQN since they share the same interface
    const aiStrategy = state.aiStrategy;
    if (!aiStrategy) {
      console.error("[TurnSlice] AI Strategy not found in state");
      return;
    }

    // Start AI turn: increment turn counter, draw cards, apply fatigue damage, reset minion attacks
    const aiTurnStart = startTurn(state.ai, state.ai.maxMana);
    const aiStartLog = [...state.combatLog, "--- Enemy Turn ---"];

    if (aiTurnStart.deckWasEmpty) {
      aiStartLog.push(
        `Enemy deck is empty! Enemy takes ${aiTurnStart.player.fatigueCounter} fatigue damage.`,
      );
    } else if (aiTurnStart.drewCard) {
      aiStartLog.push(`Enemy draws a card.`);
    } else {
      aiStartLog.push(`Enemy hand is full! Drawn card discarded.`);
    }

    set({
      ai: aiTurnStart.player,
      currentTurn: "ai",
      selectedMinion: null,
      aiTurnState: "thinking",
      aiAction: "Thinking...",
      combatLog: aiStartLog,
    });

    // Check if fatigue from AI draw ended the game
    if (
      checkGameOver(state.player.health, aiTurnStart.player.health).gameOver
    ) {
      return endGame(set, get, aiStrategy);
    }

    await delay(DELAYS.THINKING);

    // --- AI Turn FSM ----------------------
    // Each iteration is one phase of the AI's turn
    // Loop continues until the AI decides to end its turn, or until
    // the game ends (win/lose) during the turn
    let turnEnded = false;

    while (!turnEnded) {
      const currentState = get();

      const gameSnapshot: BattleState = {
        player: currentState.player,
        ai: currentState.ai,
        currentTurn: currentState.currentTurn,
        turnNumber: currentState.turnNumber,
        gameOver: currentState.gameOver,
        winner: currentState.winner,
        combatLog: currentState.combatLog,
      };

      // AI chooses its next action
      const aiAction = aiStrategy.selectAction(gameSnapshot);

      // End turn/pass to opponent
      if (aiAction.type === "pass") {
        turnEnded = true;
        break;
      }

      // Play card action
      if (aiAction.type === "play_card" && aiAction.cardIndex !== undefined) {
        const cardName =
          currentState.ai.hand[aiAction.cardIndex]?.name || "Unknown Card";

        set({
          aiTurnState: "playing_card",
          aiAction: `Playing ${cardName}...`,
        });

        await delay(DELAYS.BEFORE_ACTION);

        const result = executeAIPlayCard(aiAction.cardIndex, gameSnapshot);

        set({
          player: result.newState.player,
          ai: result.newState.ai,
          combatLog: [...currentState.combatLog, result.logMessage],
          aiAction: result.actionMessage,
          aiTurnState: "thinking",
        });

        await delay(DELAYS.AFTER_CARD_PLAY);

        // Check if card play ended the game (e.g. lethal damage was dealt)
        if (
          checkGameOver(
            result.newState.player.health,
            result.newState.ai.health,
          ).gameOver
        ) {
          return endGame(set, get, aiStrategy);
        }

        continue;
      }

      // -- Attack phase -------------------------------------------------------
      if (
        aiAction.type === "attack" &&
        aiAction.attackerId &&
        aiAction.targetId
      ) {
        const attackerName =
          currentState.ai.board.find(
            (m) => m.instanceId === aiAction.attackerId,
          )?.name ?? "A minion";

        const targetDescription =
          aiAction.targetId === "face"
            ? "your hero"
            : (currentState.player.board.find(
                (m) => m.instanceId === aiAction.targetId,
              )?.name ?? "a minion");

        set({
          aiTurnState: "attacking",
          aiAction: `Attacking ${targetDescription} with ${attackerName}...`,
        });

        await delay(DELAYS.BEFORE_ACTION);

        const result = executeAttack(
          aiAction.attackerId,
          aiAction.targetId,
          gameSnapshot,
        );

        set({
          player: result.newState.player,
          ai: result.newState.ai,
          combatLog: [...currentState.combatLog, ...result.logMessages],
          aiTurnState: "thinking",
          aiAction: "Thinking...",
        });

        await delay(DELAYS.AFTER_ATTACK);

        // Check if attack ended the game
        if (
          checkGameOver(
            result.newState.player.health,
            result.newState.ai.health,
          ).gameOver
        ) {
          return endGame(set, get, aiStrategy);
        }

        continue;
      }

      // Prevents infinite loop if an unexpected action type is returned
      // This should ideally never happen since illegal actions are masked out by the AI strategy,
      // but I'll know there's an issue with masking if this gets hit during testing
      console.warn(
        "[TurnSlice] Unrecognised AI action type, ending turn:",
        aiAction,
      );
      turnEnded = true;
    } // <-- end of endTurn FSM loop

    // Transition to turn ending state
    set({
      aiTurnState: "ending_turn",
      aiAction: undefined,
    });

    // Resolve turn: draw cards, increment mana, apply fatigue damage if needed
    const finalState = get();
    const playerTurnStart = startTurn(
      finalState.player,
      finalState.player.maxMana,
    );
    const newTurnNumber = incrementTurnNumber(finalState.turnNumber);

    const newLog = [...finalState.combatLog, `─── Turn ${newTurnNumber} ───`];

    // Player draw log:
    // If the deck was empty before the draw, fatigue applies
    // If the deck shrank, a card was drawn correctly
    // If the deck didn't shrink but wasn't empty, then the hand was full and the drawn card was discarded
    if (playerTurnStart.deckWasEmpty) {
      newLog.push(
        `Your deck is empty! You take ${playerTurnStart.player.fatigueCounter} fatigue damage.`,
      );
    } else if (playerTurnStart.drewCard) {
      newLog.push(
        `You draw: ${playerTurnStart.player.hand[playerTurnStart.player.hand.length - 1].name}`,
      );
    } else {
      newLog.push(`Your hand is full! The drawn card was discarded.`);
    }

    // Check if player fatigue ended the game
    const fatigueResult = checkGameOver(
      playerTurnStart.player.health,
      finalState.ai.health,
    );

    if (fatigueResult.gameOver) {
      set({
        player: playerTurnStart.player,
        gameOver: true,
        winner: fatigueResult.winner,
        combatLog: [
          ...newLog,
          fatigueResult.winner === "player"
            ? "=== VICTORY! ==="
            : "=== DEFEAT ===",
        ],
        aiAction: undefined,
        aiTurnState: null,
      });
      return;
    }

    // Hand control back to the player
    set({
      player: playerTurnStart.player,
      currentTurn: "player",
      turnNumber: newTurnNumber,
      combatLog: newLog,
      aiAction: undefined,
      aiTurnState: null,
      selectedMinion: null,
    });
  },
});

// --- Delay constants ------------------------------------------------------------
// Defined here only, timing can be adjusted without hunting through the file
const DELAYS = {
  THINKING: 1000, // Pause before AI takes its first action
  BEFORE_ACTION: 800, // Pause after announcing action, before executing it
  AFTER_CARD_PLAY: 1000, // Pause after a card is played before next decision
  AFTER_ATTACK: 1200, // Pause after an attack resolves before next decision
} as const;

// --- Helper Functions for AI Turn Logic -----------------------------------------
// Handle game ending - victory/defeat logic
function endGame(
  set: (state: Partial<BattleSlice & DeckSlice & TurnSlice>) => void,
  get: () => BattleSlice & DeckSlice & TurnSlice,
  aiStrategy: AIStrategy,
): void {
  const state = get();
  const gameResult = checkGameOver(state.player.health, state.ai.health);

  aiStrategy.onGameEnd?.(state, gameResult.winner === "ai");

  set({
    gameOver: true,
    winner: gameResult.winner,
    combatLog: [
      ...state.combatLog,
      gameResult.winner === "player" ? "=== VICTORY! ===" : "=== DEFEAT ===",
    ],
    aiAction: undefined,
    aiTurnState: null,
  });
}

// Execute a single attack action from the AI
// Returns the new battle state and any log messages generated by the attack
function executeAttack(
  attackerId: string,
  targetId: string,
  state: BattleState,
): { newState: BattleState; logMessages: string[] } {
  // Find the attacking minion on the AI's board and check it can attack
  const attacker = state.ai.board.find((m) => m.instanceId === attackerId);
  if (!attacker || !attacker.canAttack) {
    return { newState: state, logMessages: [] };
  }

  // Create a new state object to modify
  // Without this spread, the original state would be mutated directly,
  // which can cause bugs since Zustand needs immutability for state updates
  const newState = { ...state };
  const logMessages: string[] = [];

  // Attack hero directly if target is face
  if (targetId === "face") {
    newState.player = {
      ...newState.player,
      health: newState.player.health - attacker.attack,
    };
    logMessages.push(
      `${attacker.name} attacks you directly for ${attacker.attack} damage`,
    );

    newState.ai = {
      ...newState.ai,
      board: newState.ai.board.map((m) =>
        m.instanceId === attackerId ? { ...m, canAttack: false } : m,
      ),
    };

    return { newState, logMessages };
  }

  // Attack minion
  const target = state.player.board.find((m) => m.instanceId === targetId);
  if (!target) {
    return { newState: state, logMessages: [] };
  }

  const combatResult = handleMinionCombat(attacker, target);
  logMessages.push(`${attacker.name} attacks ${target.name}`);

  newState.ai = {
    ...newState.ai,
    board: updateBoardAfterCombat(
      newState.ai.board,
      attackerId,
      combatResult.updatedAttacker,
    ),
  };

  newState.player = {
    ...newState.player,
    board: updateBoardAfterCombat(
      newState.player.board,
      targetId,
      combatResult.updatedTarget,
    ),
  };

  if (combatResult.targetDied) logMessages.push(`${target.name} dies!`);
  if (combatResult.attackerDied) logMessages.push(`${attacker.name} dies!`);

  return { newState, logMessages };
}

// Utility function to create a delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
