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
        const state = get();
        if (state.currentTurn !== 'player' || state.gameOver) return;

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