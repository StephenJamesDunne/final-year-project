import * as PIXI from 'pixi.js';
import { Card as CardType } from '@/lib/types/game';
import { CardRenderer } from './CardRenderer';
import { BoardLayout } from '../layout/BoardLayout';

export class HandRenderer {
    constructor(
        private cardRenderer: CardRenderer,
        private layout: BoardLayout
    ) { }

    renderAIHand(container: PIXI.Container, cardCount: number): void {
        const positions = this.layout.getAIHandPositions(cardCount);

        positions.forEach((pos) => {
            const cardBack = this.cardRenderer.createCardBack();
            cardBack.x = pos.x;
            cardBack.y = pos.y;
            cardBack.scale.set(0.6);
            container.addChild(cardBack);
        });
    }

    renderPlayerHand(
        container: PIXI.Container,
        hand: CardType[],
        playerMana: number,
        currentTurn: 'player' | 'ai',
        gameOver: boolean,
        boardSize: number,
        onCardPlay: (index: number) => void
    ): void {
        const positions = this.layout.getPlayerHandPositions(hand.length);

        hand.forEach((card, i) => {
            const cardContainer = this.cardRenderer.createCard(card);
            cardContainer.x = positions[i].x;
            cardContainer.y = positions[i].y;

            const isPlayable =
                currentTurn === 'player' &&
                !gameOver &&
                card.manaCost <= playerMana &&
                (card.type !== 'minion' || boardSize < 7);

            if (isPlayable) {
                cardContainer.eventMode = 'static';
                cardContainer.cursor = 'pointer';

                cardContainer.on('pointerover', () => {
                    cardContainer.scale.set(1.1);
                    cardContainer.y -= 20;
                });

                cardContainer.on('pointerout', () => {
                    cardContainer.scale.set(1.0);
                    cardContainer.y = positions[i].y;
                });

                cardContainer.on('pointerdown', () => onCardPlay(i));
            } else {
                cardContainer.alpha = 0.6;
            }

            container.addChild(cardContainer);
        });
    }
}