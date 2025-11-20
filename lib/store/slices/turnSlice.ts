/**
 * Turn Slice
 * 
 * Purpose:
 * Carries out the complete turn cycle from player ending their turn through
 * AI execution and back to the player's next turn. This is the most complex
 * slice, coordinating multiple game systems with async timing for UI/UX.
 * 
 * Actions:
 * - endTurn(): Async function that executes the complete turn cycle
 * 
 * Async Pattern:
 * Uses await + setTimeout for visual pauses between game phases:
 * - Player sees each AI action separately
 * - Delay between turn switching allows player to read combat log updates
 * - Total AI turn: ~2-3 seconds
 * 
 * State Building Pattern:
 * Builds state changes locally in `newState` variable, then calls set()
 * once at end. More efficient than multiple set() calls. Strategic UI
 * updates (showing AI actions) use intermediate set() calls for feedback.
 * 
 * Performance Note:
 * This is an async function that makes multiple state updates. Components
 * subscribing to frequently-changing state (like combatLog or aiAction)
 * will re-render multiple times during the AI turn.
 * 
 * @see lib/game/aiPlayer.ts - AI decision making and execution
 * @see lib/game/abilitySystem.ts - End-of-turn ability processing
 * @see gameActionsSlice.ts - Player action handlers for comparison
 */

import { StateCreator } from 'zustand';
import { BattleState } from '../../types/game';
import {
    checkGameOver,
    enableMinionAttacks,
    incrementTurn
} from '../../game/gameLogic';
import { drawCards, addCardsToHand } from '../../game/deckManager';
import { processEndOfTurnEffects } from '../../game/abilitySystem';
import {
    getAIAction,
    executeAIPlayCard,
    executeAIAttacks,
    getAIDecisionDelay
} from '../../game/aiPlayer';
import { DeckSlice } from './deckSlice';
import { BattleSlice } from './battleSlice';

export interface TurnSlice {
    endTurn: () => Promise<void>;
}

export const createTurnSlice: StateCreator<TurnSlice & BattleSlice & DeckSlice, [], [], TurnSlice> = (set, get) => ({
    endTurn: async () => {

        // get the current state of the game and check it hasn't ended
        const state = get();
        if (state.currentTurn !== 'player' || state.gameOver) return;

        // swap to ai's turn
        set({ selectedMinion: null, currentTurn: 'ai' });
        await new Promise(resolve => setTimeout(resolve, 1000));

        let newState: BattleState = { ...state, currentTurn: 'ai' };
        let currentLog = [...newState.combatLog];
        currentLog.push("Enemy Turn");

        newState = processEndOfTurnEffects(newState.player.board, newState, true);

        const aiAction = getAIAction(newState.ai, newState);

        if (aiAction.type === 'play_card' && aiAction.cardIndex !== undefined) {
            const result = executeAIPlayCard(aiAction.cardIndex, newState);
            newState = result.newState;
            currentLog.push(result.logMessage);

            set({
                ...newState,
                combatLog: currentLog,
                aiAction: result.actionMessage,
            });
            await new Promise(resolve => setTimeout(resolve, getAIDecisionDelay()));

            if (result.playedCard?.abilities?.some(a => a.trigger === 'battlecry')) {
                currentLog.push(`${result.playedCard.name}'s battlecry triggers`);
            }
        } else {
            currentLog.push("Enemy has no playable cards this turn");
            set({ ...newState, combatLog: currentLog });
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        newState = processEndOfTurnEffects(newState.ai.board, newState, false);

        const attackResult = executeAIAttacks(newState);
        newState = attackResult.newState;
        currentLog.push(...attackResult.logMessages);

        if (attackResult.totalDamage > 0) {
            set({
                ...newState,
                combatLog: currentLog,
                aiAction: 'Attacking...'
            });
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        const turnResult = incrementTurn(newState.turnNumber, newState.player.maxMana);
        const playerDraw = drawCards(newState.player.deck, 1);
        const aiDraw = drawCards(newState.ai.deck, 1);

        if (playerDraw.drawn.length > 0) {
            currentLog.push(`You draw: ${playerDraw.drawn[0].name}`);
        } else {
            currentLog.push(`You draw nothing (deck empty)`);
        }
        currentLog.push(`Turn ${turnResult.turnNumber} begins (${turnResult.newMaxMana} mana)`);

        const gameResult = checkGameOver(newState.player.health, newState.ai.health);

        if (gameResult.gameOver) {
            currentLog.push(gameResult.winner === 'player' ? 'VICTORY!' : 'DEFEAT!');
        }

        set({
            ...newState,
            currentTurn: 'player',
            turnNumber: turnResult.turnNumber,
            combatLog: currentLog,
            aiAction: undefined,
            selectedMinion: null,
            player: {
                ...newState.player,
                maxMana: turnResult.newMaxMana,
                mana: turnResult.newMaxMana,
                hand: addCardsToHand(newState.player.hand, playerDraw.drawn),
                deck: playerDraw.remaining,
                board: enableMinionAttacks(newState.player.board),
            },
            ai: {
                ...newState.ai,
                maxMana: turnResult.newMaxMana,
                mana: turnResult.newMaxMana,
                hand: addCardsToHand(newState.ai.hand, aiDraw.drawn),
                deck: aiDraw.remaining,
                board: enableMinionAttacks(newState.ai.board),
            },
            ...gameResult,
        });
    },
});