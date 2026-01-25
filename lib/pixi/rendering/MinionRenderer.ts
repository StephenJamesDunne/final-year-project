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
        private layout: BoardLayout,
        private onHover?: (card: Minion | null, x: number, y: number) => void
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

            // allow for AI card container elements to receive pointer events (eventMode is 'auto' by default)
            minionCard.eventMode = 'static';

            minionCard.on('pointerover', (e: PIXI.FederatedPointerEvent) => {
                this.onHover?.(minion, e.globalX, e.globalY);
            });

            minionCard.on('pointerout', () => {
                this.onHover?.(null, 0, 0);
            });

            if (selectedMinion && currentTurn === 'player') {
                const isValidTarget = !hasTauntOnBoard || hasTaunt(minion);

                if (isValidTarget) {
                    const targetGlow = this.cardRenderer.createTargetGlow();
                    minionCard.addChildAt(targetGlow, 0);
                    minionCard.cursor = 'pointer';
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

                // Logic to allow for tooltip/detailed view of cards hovered over
                minionCard.on('pointerover', (e: PIXI.FederatedPointerEvent) => {
                    if (minion.canAttack) {
                        minionCard.scale.set(1.05);
                    }
                    this.onHover?.(minion, e.globalX, e.globalY);
                });

                minionCard.on('pointerout', () => {
                    minionCard.scale.set(1.0);
                    this.onHover?.(null, 0, 0);
                });

                if (minion.canAttack) {
                    minionCard.cursor = 'pointer';
                    minionCard.on('pointerdown', () => onMinionClick(minion.instanceId, true));
                }
            }

            container.addChild(minionCard);
        });
    }
}