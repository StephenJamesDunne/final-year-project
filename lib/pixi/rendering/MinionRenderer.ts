import * as PIXI from 'pixi.js';
import { Minion } from '@/lib/types/game';
import { CardRenderer } from './CardRenderer';
import { BoardLayout } from '../layout/BoardLayout';
import { boardHasTaunt, hasTaunt } from '@/lib/game/gameLogic';

/* TODO: Refactor this page so that minions drawn on the board are designed closer to cards in the hand.
Need to consolidate these designs for better cohesion and UX. */


export class MinionRenderer {
    constructor(
        private cardRenderer: CardRenderer,
        private layout: BoardLayout
    ) { }

    renderAIBoard(
        container: PIXI.Container,
        aiBoard: Minion[],
        selectedMinion: string | null,
        currentTurn: 'player' | 'ai',
        onTargetClick: (targetId: string) => void
    ): void {
        const positions = this.layout.getAIBoardPositions(aiBoard.length);

        const hasTauntOnBoard = boardHasTaunt(aiBoard);

        aiBoard.forEach((minion, i) => {
            const minionCard = this.cardRenderer.createMinionCard(minion, false);
            minionCard.x = positions[i].x;
            minionCard.y = positions[i].y;

            if (selectedMinion && currentTurn === 'player') {
                const isValidTarget = !hasTauntOnBoard || hasTaunt(minion);

                if (isValidTarget) {
                    const targetGlow = this.cardRenderer.createTargetGlow();
                    minionCard.addChildAt(targetGlow, 0);

                    minionCard.eventMode = 'static';
                    minionCard.cursor = 'crosshair';
                    minionCard.on('pointerdown', () => onTargetClick(minion.instanceId));
                } else {
                    // Dim non-Taunt minions when Taunt exists
                    minionCard.alpha = 0.5;
                }
            }

            container.addChild(minionCard);
        });
    }

    renderPlayerBoard(
        container: PIXI.Container,
        playerBoard: Minion[],
        selectedMinion: string | null,
        currentTurn: 'player' | 'ai',
        gameOver: boolean,
        onMinionClick: (minionId: string, isPlayer: boolean) => void
    ): void {
        const positions = this.layout.getPlayerBoardPositions(playerBoard.length);

        playerBoard.forEach((minion, i) => {
            const minionCard = this.cardRenderer.createMinionCard(minion, true);
            minionCard.x = positions[i].x;
            minionCard.y = positions[i].y;

            if (minion.instanceId === selectedMinion) {
                const attackGlow = this.cardRenderer.createAttackGlow();
                minionCard.addChildAt(attackGlow, 0);
            }

            if (currentTurn === 'player' && !gameOver) {
                minionCard.eventMode = 'static';
                minionCard.cursor = 'pointer';

                minionCard.on('pointerover', () => {
                    if (minion.canAttack) {
                        minionCard.scale.set(1.05);
                    }
                });

                minionCard.on('pointerout', () => {
                    minionCard.scale.set(1.0);
                });

                minionCard.on('pointerdown', () => onMinionClick(minion.instanceId, true));
            }

            container.addChild(minionCard);
        });
    }
}