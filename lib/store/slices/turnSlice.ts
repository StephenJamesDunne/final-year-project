import { StateCreator } from "zustand";
import { DeckSlice } from "./deckSlice";
import { BattleSlice } from "./battleSlice";
import { BattleState } from "../../types/game";
import { drawCards, addCardsToHand } from "../../game/deckManager";
import { executeAIPlayCard } from "@/lib/game/aiPlayer";
import {
  checkGameOver,
  enableMinionAttacks,
  incrementTurn,
  handleMinionCombat,
  updateBoardAfterCombat,
} from "@/lib/game/gameLogic";

// interface for the turn slice of the Zustand store; manages turn progression and AI actions during the AI's turn
export interface TurnSlice {
  endTurn: () => Promise<void>;
}

export const createTurnSlice: StateCreator<
  TurnSlice & BattleSlice & DeckSlice,
  [],
  [],
  TurnSlice
> = (set, get) => ({
  endTurn: async () => {
    // get the current state of the game and check it hasn't ended
    const state = get();
    if (state.currentTurn !== "player" || state.gameOver) return;

    // Get AI Strategy; works for both rule-based and DQN since they share the same interface
    const aiStrategy = state.aiStrategy;

    let battleState: BattleState = {
      player: { ...state.player },
      ai: { ...state.ai },
      currentTurn: "ai",
      turnNumber: state.turnNumber,
      gameOver: state.gameOver,
      winner: state.winner,
      combatLog: [...state.combatLog, "─── Enemy Turn ───"],
    };

    set({
      ...battleState,
      selectedMinion: null,
      aiAction: "Thinking...",
    });

    await delay(500);

    // AI plays cards using the selected strategy
    let keepPlaying = true;

    while (keepPlaying) {
      const currentState = get();

      // Use strategy pattern for AI type
      const aiAction = aiStrategy.selectAction({
        player: currentState.player,
        ai: currentState.ai,
        currentTurn: currentState.currentTurn,
        turnNumber: currentState.turnNumber,
        gameOver: currentState.gameOver,
        winner: currentState.winner,
        combatLog: currentState.combatLog,
      });

      // If the AI decides to pass or if the action is invalid, end the card-playing phase
      if (aiAction.type !== "play_card" || aiAction.cardIndex === undefined) {
        keepPlaying = false;
        continue;
      }

      // Execute the AI's chosen action and update the state accordingly
      const result = executeAIPlayCard(aiAction.cardIndex, {
        player: currentState.player,
        ai: currentState.ai,
        currentTurn: currentState.currentTurn,
        turnNumber: currentState.turnNumber,
        gameOver: currentState.gameOver,
        winner: currentState.winner,
        combatLog: currentState.combatLog,
      });

      // Update the battle state with the results of the AI's action
      battleState = result.newState;
      battleState.combatLog = [...battleState.combatLog, result.logMessage];

      set({
        ...battleState,
        aiAction: result.actionMessage,
      });

      await delay(600);

      const gameResult = checkGameOver(
        battleState.player.health,
        battleState.ai.health,
      );

      if (gameResult.gameOver) {
        // Notify the AI strategy of the game result (for learning in DQN)
        aiStrategy.onGameEnd?.(battleState, gameResult.winner === "ai");

        // Update the state with the game result and end the game
        set({
          ...battleState,
          ...gameResult,
          combatLog: [
            ...battleState.combatLog,
            gameResult.winner === "player"
              ? "=== VICTORY! ==="
              : " === DEFEAT ===",
          ],
          aiAction: undefined,
        });
        return;
      }
    }

    // After playing cards, let the AI perform attacks
    let attackLogMessages: string[] = [];

    while (true) {
      const currentState = get();

      // Use strategy pattern for AI type to select an attack action; if the action is invalid or if the AI decides to pass, end the attack phase
      const action = aiStrategy.selectAction({
        player: currentState.player,
        ai: currentState.ai,
        currentTurn: currentState.currentTurn,
        turnNumber: currentState.turnNumber,
        gameOver: currentState.gameOver,
        winner: currentState.winner,
        combatLog: currentState.combatLog,
      });

      if (action.type !== "attack" || !action.attackerId || !action.targetId) {
        break;
      }

      // Execute the AI's chosen attack action and update the state accordingly
      const result = executeAttack(action.attackerId, action.targetId, {
        player: currentState.player,
        ai: currentState.ai,
        currentTurn: currentState.currentTurn,
        turnNumber: currentState.turnNumber,
        gameOver: currentState.gameOver,
        winner: currentState.winner,
        combatLog: currentState.combatLog,
      });

      set({
        player: result.newState.player,
        ai: result.newState.ai,
        combatLog: [...currentState.combatLog, ...result.logMessages],
      });

      attackLogMessages.push(...result.logMessages);

      const gameResult = checkGameOver(
        result.newState.player.health,
        result.newState.ai.health,
      );

      if (gameResult.gameOver) {
        aiStrategy.onGameEnd?.(result.newState, gameResult.winner === "ai");

        set({
          ...result.newState,
          ...gameResult,
          combatLog: [
            ...result.newState.combatLog,
            gameResult.winner === "player"
              ? "=== VICTORY! ==="
              : " === DEFEAT ===",
          ],
          aiAction: undefined,
        });
        return;
      }
    }
  },
});

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
  let newState = { ...state };
  const logMessages: string[] = [];

  // Attack hero
  if (targetId === "face") {
    newState.player.health -= attacker.attack;
    logMessages.push(`${attacker.name} attacks for ${attacker.attack} damage`);

    newState.ai.board = newState.ai.board.map((m) =>
      m.instanceId === attackerId ? { ...m, canAttack: false } : m
    );

    return { newState, logMessages };
  }

  // Attack minion
  const target = state.player.board.find((m) => m.instanceId === targetId);
  if (!target) {
    return { newState: state, logMessages: [] };
  }

  const combatResult = handleMinionCombat(attacker, target);
  logMessages.push(`${attacker.name} attacks ${target.name}`);

  newState.ai.board = updateBoardAfterCombat(
    newState.ai.board,
    attackerId,
    combatResult.updatedAttacker,
  );

  newState.player.board = updateBoardAfterCombat(
    newState.player.board,
    targetId,
    combatResult.updatedTarget,
  );

  if (combatResult.targetDied) logMessages.push(`${target.name} dies!`);
  if (combatResult.attackerDied) logMessages.push(`${attacker.name} dies!`);

  return { newState, logMessages };
}

// Utility function to create a delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
