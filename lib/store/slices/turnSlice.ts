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
import { AIStrategy } from "@/lib/ai/aiStrategy";

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

    set({
      currentTurn: "ai",
      selectedMinion: null,
      aiAction: "Thinking...",
      combatLog: [...state.combatLog, "--- Enemy Turn ---"],
    });

    await delay(500);

    // Phase 1 of AI Turn: AI plays cards using the selected strategy
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

      set({
        player: result.newState.player,
        ai: result.newState.ai,
        combatLog: [...result.newState.combatLog, result.logMessage],
        aiAction: result.actionMessage,
      });

      await delay(600);

      // Check if card play ended the game
      if (checkGameOver(result.newState.player.health, result.newState.ai.health).gameOver) {
        return endGame(set, get, aiStrategy);
      }
    }

    // Second phase of AI turn: after playing cards, AI performs attacks with valid minions
    const attackMessages: string[] = [];
    let keepAttacking = true;

    while (keepAttacking) {
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
        keepAttacking = false;
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

      attackMessages.push(...result.logMessages);

      set({
        player: result.newState.player,
        ai: result.newState.ai,
        combatLog: [...currentState.combatLog, ...result.logMessages],
      });

      // Check if attack ended the game
      if (checkGameOver(result.newState.player.health, result.newState.ai.health).gameOver) {
        return endGame(set, get, aiStrategy);
      }
    }

    // Show attack animation if any attacks happened
    if (attackMessages.length > 0) {
      set({ aiAction: "Attacking..." });
      await delay(800);
    }

    // Last/fallback phase for AI turn: start new turn
    const finalState = get();
    const turnResult = incrementTurn(finalState.turnNumber, finalState.player.maxMana);
    const playerDraw = drawCards(finalState.player.deck, 1);
    const aiDraw = drawCards(finalState.ai.deck, 1);

    const newLog = [...finalState.combatLog, `─── Turn ${turnResult.turnNumber} ───`];

    if (playerDraw.drawn.length > 0) {
      newLog.push(`You draw: ${playerDraw.drawn[0].name}`);
    } else {
      newLog.push("Your deck is empty!");
    }

    set({
      player: {
        ...finalState.player,
        mana: turnResult.newMaxMana,
        maxMana: turnResult.newMaxMana,
        hand: addCardsToHand(finalState.player.hand, playerDraw.drawn),
        deck: playerDraw.remaining,
        board: enableMinionAttacks(finalState.player.board),
      },
      ai: {
        ...finalState.ai,
        mana: turnResult.newMaxMana,
        maxMana: turnResult.newMaxMana,
        hand: addCardsToHand(finalState.ai.hand, aiDraw.drawn),
        deck: aiDraw.remaining,
        board: enableMinionAttacks(finalState.ai.board),
      },
      currentTurn: "player",
      turnNumber: turnResult.turnNumber,
      combatLog: newLog,
      aiAction: undefined,
      selectedMinion: null,
    });
  },
});

// Handle game ending - victory/defeat logic
function endGame(
  set: (state: Partial<BattleSlice & DeckSlice & TurnSlice>) => void,
  get: () => BattleSlice & DeckSlice & TurnSlice,
  aiStrategy: AIStrategy
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
