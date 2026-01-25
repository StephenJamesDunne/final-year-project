import * as PIXI from 'pixi.js';
import { Card, Minion } from '@/lib/types/game';
import { COLORS, FONTS } from '../utils/StyleConstants'
import { desc } from 'framer-motion/client';

export class HoverCardDisplay {
    private container: PIXI.Container;
    private readonly WIDTH = 200;
    private readonly HEIGHT = 280;

    constructor() {
        this.container = new PIXI.Container();
        this.container.visible = false;
        this.container.zIndex = 1000; // z-ordering; keep this element above all others on screen when it's active
    }

    getContainer(): PIXI.Container {
        return this.container;
    }

    // Function for detailed view of a card upon hover/highlight
    show(card: Card | Minion, globalX: number, globalY: number, screenWidth: number, screenHeight: number): void {
        this.container.removeChildren();

        const bg = this.createBackground(card);
        this.container.addChild(bg);

        const nameText = this.createNameText(card.name);
        this.container.addChild(nameText);

        const statsText = this.createStatsText(card);
        this.container.addChild(statsText);

        const descText = this.createDescriptionText(card.description);
        this.container.addChild(descText);

        let x = globalX + 50;
        let y = globalY - this.HEIGHT / 2;

        // Push tooltip to left side of the screen if too close to right edge
        // Prevents cards in the far right of the player's hand from having their 
        // detailed views go off screen
        if (x + this.WIDTH > screenWidth - 10) {
            x = globalX - this.WIDTH - 20;
        }

        // Keep within vertical bounds of the screen
        if (y < 10) y = 10;
        if (y + this.HEIGHT > screenHeight - 10) {
            y = screenHeight - this.HEIGHT - 10;
        }

        this.container.x = x;
        this.container.y = y;
        this.container.visible = true;
    }

    hide(): void {
        this.container.visible = false;
    }

    // Background elements of the detailed card view
    // (need to mess with these values for a better looking tooltip)
    private createBackground(card: Card | Minion): PIXI.Graphics {
        const bg = new PIXI.Graphics();

        bg.roundRect(0, 0, this.WIDTH, this.HEIGHT, 8);
        bg.fill({ color: COLORS.UI.darkBg, alpha: 0.95 });
        bg.stroke({ width: 3, color: this.getElementBorderColor(card.element) });

        bg.roundRect(3, 3, this.WIDTH - 6, this.HEIGHT - 6, 6);
        bg.stroke({ width: 1, color: COLORS.UI.gold, alpha: 0.3 });

        return bg;
    }

    // Name of the card in detailed view
    private createNameText(name: string): PIXI.Text {
        const text = new PIXI.Text({
            text: name,
            style: {
                fontSize: 16,
                fontWeight: 'bold',
                fill: COLORS.UI.white,
                wordWrap: true,
                wordWrapWidth: this.WIDTH - 20,
            },
        });
        text.x = this.WIDTH / 2;
        text.y = 15;
        text.anchor.set(0.5, 0);
        return text;
    }

    // Cost, type, attack and health of card in detailed view
    private createStatsText(card: Card | Minion): PIXI.Text {
        let statsString = `Cost: ${card.manaCost}`;

        if (card.type === 'minion') {
            const minion = card as Minion;

            // Show health and attack of minion in detailed view
            // Also show current health value, if highlighted card is a minion on the board
            if ('currentHealth' in minion) {
                statsString += `  |  ${minion.attack}/${minion.currentHealth}`;
                if (minion.currentHealth < minion.health) {
                    statsString += ` (${minion.health})`;
                }
            } else {
                statsString += `  |  ${card.attack}/${card.health}`;
            }
        }

        const text = new PIXI.Text({
            text: statsString,
            style: {
                fontSize: 14,
                fill: COLORS.UI.gold,
            },
        });
        text.x = this.WIDTH / 2;
        text.y = 45;
        text.anchor.set(0.5, 0);
        return text;
    }

    // Description text of card in detailed view
    // Either actual game effects, or some lore text if the minion has no effects
    private createDescriptionText(description: string): PIXI.Text {
        const text = new PIXI.Text({
            text: description,
            style: {
                fontSize: 13,
                fill: COLORS.UI.logText,
                wordWrap: true,
                wordWrapWidth: this.WIDTH - 30,
                lineHeight: 18,
            },
        });
        text.x = 15;
        text.y = 75;
        return text;
    }

    // Returns the border color of each card based on their element
    // Used in defining the background color in detailed view
    private getElementBorderColor(element: string): number {
        return COLORS.BORDERS[element as keyof typeof COLORS.BORDERS] || COLORS.BORDERS.neutral;
    }
}