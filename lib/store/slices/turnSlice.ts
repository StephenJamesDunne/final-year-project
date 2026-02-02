/**
 * Turn Slice
 * 
 * Handles the turn cycle:
 * 1. Player ends their turn
 * 2. endTurn async function call - AI turn begins
 * 3. AI plays cards to spend mana, then attacks
 * 4. New turn starts, both players draw and refresh mana
 */

import { StateCreator } from 'zustand';
import { DeckSlice } from './deckSlice';
import { BattleSlice } from './battleSlice';
import { BattleState } from '../../types/game';
import { drawCards, addCardsToHand } from '../../game/deckManager';
import { getAIAction, executeAIPlayCard, executeAIAttacks, } from '../../game/aiPlayer';
import { checkGameOver, enableMinionAttacks, incrementTurn } from '../../game/gameLogic';

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

        if (state.currentTurn !== 'player' || state.gameOver) return;

        ///
        /// Switch to AI's turn
        ///
        let battleState: BattleState = {
            player: { ...state.player },
            ai: { ...state.ai },
            currentTurn: 'ai',
            turnNumber: state.turnNumber,
            gameOver: state.gameOver,
            winner: state.winner,
            combatLog: [...state.combatLog, '─── Enemy Turn ───'],
        };

        set({
            ...battleState,
            selectedMinion: null,
            aiAction: 'Thinking...',
        });

        await delay(500);

        ///
        /// AI plays cards to spend all its current mana
        ///
        let keepPlaying = true;

        while (keepPlaying) {
            const currentState = get();
            const aiAction = getAIAction(currentState.ai, currentState);

            if (aiAction.type !== 'play_card' || aiAction.cardIndex === undefined) {
                keepPlaying = false;
                continue;
            }

            const result = executeAIPlayCard(aiAction.cardIndex, {
                player: currentState.player,
                ai: currentState.ai,
                currentTurn: currentState.currentTurn,
                turnNumber: currentState.turnNumber,
                gameOver: currentState.gameOver,
                winner: currentState.winner,
                combatLog: currentState.combatLog,
            });

            battleState = result.newState;
            battleState.combatLog = [...battleState.combatLog, result.logMessage];

            set({
                ...battleState,
                aiAction: result.actionMessage,
            });

            await delay(600);

            const gameResult = checkGameOver(battleState.player.health, battleState.ai.health);

            if (gameResult.gameOver) {
                set({
                    ...battleState,
                    ...gameResult,
                    combatLog: [
                        ...battleState.combatLog,
                        gameResult.winner === 'player' ? '=== VICTORY! ===' : ' === DEFEAT ===',
                    ],
                    aiAction: undefined,
                });
                return;
            }
        }

        ///
        /// AI attacks
        ///
        const stateBeforeAttacks = get();

        const attackResult = executeAIAttacks({
            player: stateBeforeAttacks.player,
            ai: stateBeforeAttacks.ai,
            currentTurn: stateBeforeAttacks.currentTurn,
            turnNumber: stateBeforeAttacks.turnNumber,
            gameOver: stateBeforeAttacks.gameOver,
            winner: stateBeforeAttacks.winner,
            combatLog: stateBeforeAttacks.combatLog,
        });

        battleState = attackResult.newState;

        if (attackResult.logMessages.length > 0) {
            battleState.combatLog = [...battleState.combatLog, ...attackResult.logMessages];

            set({
                ...battleState,
                aiAction: 'Attacking...',
            });

            await delay(800);
        }

        // Check for game over after attacks
        const gameResultAfterAttacks = checkGameOver(
            battleState.player.health,
            battleState.ai.health
        );

        if (gameResultAfterAttacks.gameOver) {
            set({
                ...battleState,
                ...gameResultAfterAttacks,
                combatLog: [
                    ...battleState.combatLog,
                    gameResultAfterAttacks.winner === 'player' ? '═══ VICTORY! ═══' : '═══ DEFEAT ═══',
                ],
                aiAction: undefined,
            });
            return;
        }

        ///
        /// Start new turn
        ///

        const turnResult = incrementTurn(battleState.turnNumber, battleState.player.maxMana);

        const playerDraw = drawCards(battleState.player.deck, 1);
        const aiDraw = drawCards(battleState.ai.deck, 1);

        const newLog = [...battleState.combatLog, `─── Turn ${turnResult.turnNumber} ───`];

        if (playerDraw.drawn.length > 0) {
            newLog.push(`You draw: ${playerDraw.drawn[0].name}`);
        } else {
            newLog.push('Your deck is empty!');
        }

        set({
            player: {
                ...battleState.player,
                mana: turnResult.newMaxMana,
                maxMana: turnResult.newMaxMana,
                hand: addCardsToHand(battleState.player.hand, playerDraw.drawn),
                deck: playerDraw.remaining,
                board: enableMinionAttacks(battleState.player.board),
            },
            ai: {
                ...battleState.ai,
                mana: turnResult.newMaxMana,
                maxMana: turnResult.newMaxMana,
                hand: addCardsToHand(battleState.ai.hand, aiDraw.drawn),
                deck: aiDraw.remaining,
                board: enableMinionAttacks(battleState.ai.board),
            },
            currentTurn: 'player',
            turnNumber: turnResult.turnNumber,
            combatLog: newLog,
            gameOver: battleState.gameOver,
            winner: battleState.winner,
            aiAction: undefined,
            selectedMinion: null,
        });
    },
});

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}