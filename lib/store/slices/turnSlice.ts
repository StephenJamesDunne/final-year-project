import { StateCreator } from 'zustand';
import { DeckSlice } from './deckSlice';
import { BattleSlice } from './battleSlice';
import { BattleState } from '../../types/game';
import { drawCards, addCardsToHand } from '../../game/deckManager';
import { executeAIPlayCard, executeAIAttacks } from '@/lib/game/aiPlayer';
import { checkGameOver, enableMinionAttacks, incrementTurn } from '@/lib/game/gameLogic';

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

        if (state.currentTurn !== 'player' || state.gameOver) return;

        // Get AI Strategy; works for both rule-based and DQN since they share the same interface
        const aiStrategy = state.aiStrategy;

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
            if (aiAction.type !== 'play_card' || aiAction.cardIndex === undefined) {
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

            const gameResult = checkGameOver(battleState.player.health, battleState.ai.health);

            if (gameResult.gameOver) {

                // Notify the AI strategy of the game result (for learning in DQN)
                aiStrategy.onGameEnd?.(battleState, gameResult.winner === 'ai');

                // Update the state with the game result and end the game
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

        // AI attacks after playing cards
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

            // Notify the AI strategy of the game result (for learning in DQN)
            aiStrategy.onGameEnd?.(battleState, gameResultAfterAttacks.winner === 'ai');

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

        // Start new turn: increment turn number, increase mana, draw cards, and enable minion attacks
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

// Utility function to create a delay
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}