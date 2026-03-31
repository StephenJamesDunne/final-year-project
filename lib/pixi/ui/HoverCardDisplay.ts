import * as PIXI from 'pixi.js';
import { Card, Minion } from '@/lib/types/game';
import { CARD_DIMENSIONS } from '../utils/StyleConstants';
import { CardRenderer } from '../rendering/CardRenderer';

// Tooltip renders the card again, just scaled up
const CARD_SCALE = 2;

export class HoverCardDisplay {
    private container: PIXI.Container;
    private cardRenderer: CardRenderer;

    private readonly WIDTH = CARD_DIMENSIONS.WIDTH * CARD_SCALE;
    private readonly HEIGHT = CARD_DIMENSIONS.HEIGHT * CARD_SCALE;

    private readonly CURSOR_OFFSET = 50;
    private readonly EDGE_PADDING = 50;

    constructor(cardRenderer: CardRenderer) {
        this.cardRenderer = cardRenderer;
        this.container = new PIXI.Container();
        this.container.visible = false; // Start hidden
        this.container.zIndex = 1000; // Ensure it's on top of everything else at all times
    }

    getContainer(): PIXI.Container {
        return this.container;
    }

    show(
      card: Card | Minion,
      globalX: number,
      globalY: number,
      screenWidth: number,
      screenHeight: number,
    ): void {
        this.container.removeChildren(); // Clear previous card

        // Using the actual card renderer - board minions get createMinionCard,
        // hand cards and spells get createCard
        const cardDisplay = this.cardRenderer.createCard(
            card,
            true,
            1,
            2,
        );

        this.container.addChild(cardDisplay);

        const position = this.calculatePosition(
            globalX,
            globalY,
            screenWidth,
            screenHeight,
        );
        this.container.x = position.x;
        this.container.y = position.y;
        this.container.visible = true;
    }

    hide(): void {
        this.container.visible = false;
    }

    private calculatePosition(
        cursorX: number,
        cursorY: number,
        screenWidth: number,
        screenHeight: number,
    ): { x: number; y: number } {
        let x = cursorX + this.CURSOR_OFFSET;
        let y = cursorY - this.HEIGHT / 2;

        if (x + this.WIDTH > screenWidth - this.EDGE_PADDING) {
            x = cursorX - this.WIDTH - this.CURSOR_OFFSET;
        }

        if (y < this.EDGE_PADDING) {
            y = this.EDGE_PADDING;
        }

        if (y + this.HEIGHT > screenHeight - this.EDGE_PADDING) {
            y = screenHeight - this.HEIGHT - this.EDGE_PADDING;
        }

        return { x, y };
    }
  }