import * as PIXI from 'pixi.js';
import { Card as CardType, Minion } from '@/lib/types/game';
import { TextureLoader } from '../utils/TextureLoader';
import { CARD_DIMENSIONS, COLORS, FONTS } from '../utils/StyleConstants';
import { GraphicsHelpers } from '../utils/GraphicsHelpers';

export class CardRenderer {
    private textureLoader = TextureLoader.getInstance();
    private readonly CARD_WIDTH = CARD_DIMENSIONS.WIDTH;
    private readonly CARD_HEIGHT = CARD_DIMENSIONS.HEIGHT;

    /**
     * Load card assets
     */
    async loadAssets(): Promise<void> {
        console.log('CardRenderer: Loading assets...');

        try {
            await this.textureLoader.loadTexture('card-frame', '/images/default/card-frame.png');
            await this.textureLoader.loadTexture('card-back', '/images/default/card-back.png');
            console.log('CardRenderer: Assets loaded successfully');
        } catch (error) {
            console.warn('CardRenderer: Some assets failed to load, using fallbacks', error);
        }
    }

    /**
     * Create a card with actual artwork
     */
    createCard(card: CardType, showName: boolean = true): PIXI.Container {
        const container = new PIXI.Container();

        const shadow = GraphicsHelpers.createShadow(this.CARD_WIDTH, this.CARD_HEIGHT, CARD_DIMENSIONS.BORDER_RADIUS);
        container.addChild(shadow);

        const bg = this.createCardBackground(card);
        container.addChild(bg);

        const frame = this.createCardFrame(card);
        container.addChild(frame);

        if (showName) {
            const nameBanner = this.createNameBanner(card.name);
            nameBanner.y = this.CARD_HEIGHT - 25;
            container.addChild(nameBanner);
        }

        const manaCost = this.createManaCrystal(card.manaCost);
        manaCost.x = -8;
        manaCost.y = -8;
        container.addChild(manaCost);

        if (card.type === 'minion' && card.attack !== undefined && card.health !== undefined) {
            const attackBadge = this.createAttackBadge(card.attack);
            attackBadge.x = -8;
            attackBadge.y = this.CARD_HEIGHT - 20;
            container.addChild(attackBadge);

            const healthBadge = this.createHealthBadge(card.health);
            healthBadge.x = this.CARD_WIDTH - 20;
            healthBadge.y = this.CARD_HEIGHT - 20;
            container.addChild(healthBadge);
        }

        return container;
    }

    /**
     * Create minion card for board
     */
    createMinionCard(minion: Minion, isPlayer: boolean): PIXI.Container {
        const container = new PIXI.Container();

        const shadow = GraphicsHelpers.createShadow(this.CARD_WIDTH, this.CARD_HEIGHT, CARD_DIMENSIONS.BORDER_RADIUS);
        container.addChild(shadow);

        if (minion.imageUrl) {
            this.loadCardArt(minion.imageUrl, container);
        } else {
            const placeholder = this.createArtPlaceholder(minion);
            container.addChild(placeholder);
        }

        const frame = this.createCardFrame(minion);
        container.addChild(frame);

        const attackBadge = this.createAttackBadge(minion.attack);
        attackBadge.x = -8;
        attackBadge.y = this.CARD_HEIGHT - 20;
        container.addChild(attackBadge);

        const isDamaged = minion.currentHealth < minion.health;
        const healthBadge = this.createHealthBadge(minion.currentHealth, isDamaged);
        healthBadge.x = this.CARD_WIDTH - 20;
        healthBadge.y = this.CARD_HEIGHT - 20;
        container.addChild(healthBadge);

        return container;
    }

    /**
     * Create card back for AI hand
     */
    createCardBack(): PIXI.Container {
        const container = new PIXI.Container();

        const shadow = GraphicsHelpers.createShadow(this.CARD_WIDTH, this.CARD_HEIGHT, CARD_DIMENSIONS.BORDER_RADIUS);
        container.addChild(shadow);

        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, CARD_DIMENSIONS.BORDER_RADIUS);
        bg.fill({ color: COLORS.UI.deckBg, alpha: 0.95 });
        bg.stroke({ width: 3, color: COLORS.UI.brown });
        container.addChild(bg);

        const cardBackKey = 'card-back';
        if (this.textureLoader.hasTexture(cardBackKey)) {
            const sprite = new PIXI.Sprite(this.textureLoader.getTexture(cardBackKey));
            sprite.width = this.CARD_WIDTH - 10;
            sprite.height = this.CARD_HEIGHT - 10;
            sprite.x = 5;
            sprite.y = 5;
            container.addChild(sprite);
        } else {
            const pattern = this.createCelticPattern();
            pattern.x = this.CARD_WIDTH / 2;
            pattern.y = this.CARD_HEIGHT / 2;
            container.addChild(pattern);
        }

        return container;
    }

    // ============================================
    // HELPER METHODS FOR CARD ELEMENTS
    // ============================================

    private createCardBackground(card: CardType | Minion, isPlayer?: boolean): PIXI.Graphics {
        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, CARD_DIMENSIONS.BORDER_RADIUS);

        let color = this.getElementColor(card.element);

        if ('instanceId' in card && isPlayer !== undefined) {
            color = isPlayer ? COLORS.TEAMS.player : COLORS.TEAMS.ai;
        }

        bg.fill({ color, alpha: 1.0 });
        bg.stroke({ width: 3, color: this.getElementBorderColor(card.element) });

        return bg;
    }

    private async loadCardArt(imageUrl: string, container: PIXI.Container): Promise<void> {
        try {
            const texture = await this.textureLoader.loadTexture(imageUrl, imageUrl);

            const artContainer = new PIXI.Container();
            artContainer.x = 8;
            artContainer.y = 30;

            const mask = new PIXI.Graphics();
            mask.roundRect(0, 0, this.CARD_WIDTH - 16, 70, 4);
            mask.fill(COLORS.UI.cardFill);

            const sprite = new PIXI.Sprite(texture);
            sprite.width = this.CARD_WIDTH - 16;
            sprite.height = 70;

            artContainer.addChild(mask);
            artContainer.addChild(sprite);
            sprite.mask = mask;

            container.addChildAt(artContainer, 2);
        } catch (error) {
            console.warn('Failed to load card art:', imageUrl);
        }
    }

    private createArtPlaceholder(card: CardType | Minion): PIXI.Container {
        const placeholder = new PIXI.Container();
        placeholder.x = 8;
        placeholder.y = 30;

        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, this.CARD_WIDTH - 16, 70, 4);
        bg.fill({ color: COLORS.UI.darkBg, alpha: 1 });
        placeholder.addChild(bg);

        const icon = new PIXI.Text({
            style: { fontSize: 40 }
        });
        icon.x = (this.CARD_WIDTH - 16) / 2;
        icon.y = 35;
        icon.anchor.set(0.5);
        placeholder.addChild(icon);

        return placeholder;
    }

    private createCardFrame(card: CardType | Minion): PIXI.Graphics {
        const frame = new PIXI.Graphics();
        frame.roundRect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, CARD_DIMENSIONS.BORDER_RADIUS);
        frame.stroke({ width: 2, color: COLORS.UI.gold, alpha: 0.6 });

        frame.roundRect(4, 4, this.CARD_WIDTH - 8, this.CARD_HEIGHT - 8, 6);
        frame.stroke({ width: 1, color: COLORS.UI.lightGold, alpha: 0.3 });

        return frame;
    }

    private createNameBanner(name: string, compact: boolean = false): PIXI.Container {
        const banner = new PIXI.Container();

        const bg = new PIXI.Graphics();
        bg.roundRect(5, 0, this.CARD_WIDTH - 10, 20, 4);
        bg.fill({ color: COLORS.UI.darkBg, alpha: 0.95 });
        bg.stroke({ width: 1, color: COLORS.UI.lightGold });
        banner.addChild(bg);

        const text = new PIXI.Text({
            text: name,
            style: {
                fontSize: compact ? 9 : FONTS.CARD_NAME.fontSize,
                fontWeight: FONTS.CARD_NAME.fontWeight as any,
                fill: FONTS.CARD_NAME.fill,
                stroke: { color: COLORS.UI.black, width: 2 },
                align: 'center',
            }
        });
        text.x = this.CARD_WIDTH / 2;
        text.y = 10;
        text.anchor.set(0.5);
        banner.addChild(text);

        return banner;
    }

    private createManaCrystal(cost: number): PIXI.Container {
        return GraphicsHelpers.createHexagon(16, COLORS.UI.blue, cost);
    }

    private createAttackBadge(attack: number): PIXI.Container {
        return GraphicsHelpers.createCircleBadge(attack, COLORS.ELEMENTS.fire, 16);
    }

    private createHealthBadge(health: number, isDamaged: boolean = false): PIXI.Container {
        return GraphicsHelpers.createCircleBadge(
            health,
            isDamaged ? COLORS.ELEMENTS.fire : COLORS.ELEMENTS.earth,
            16
        );
    }

    private createCelticPattern(): PIXI.Graphics {
        const pattern = new PIXI.Graphics();

        pattern.circle(0, 0, 30);
        pattern.stroke({ width: 3, color: COLORS.UI.brown });

        pattern.circle(0, 0, 20);
        pattern.stroke({ width: 2, color: COLORS.UI.gold });

        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i;
            const x = 15 * Math.cos(angle);
            const y = 15 * Math.sin(angle);
            pattern.circle(x, y, 8);
            pattern.fill({ color: COLORS.UI.deckBg, alpha: 0.8 });
            pattern.stroke({ width: 2, color: COLORS.UI.gold });
        }

        return pattern;
    }

    createAttackGlow(): PIXI.Graphics {
        const glow = new PIXI.Graphics();
        glow.roundRect(-5, -5, this.CARD_WIDTH + 10, this.CARD_HEIGHT + 10, 10);
        glow.fill({ color: COLORS.UI.forestGlow, alpha: 0.3 });
        return glow;
    }

    createTargetGlow(): PIXI.Graphics {
        const glow = new PIXI.Graphics();
        glow.roundRect(-5, -5, this.CARD_WIDTH + 10, this.CARD_HEIGHT + 10, 10);
        glow.fill({ color: COLORS.UI.red, alpha: 0.3 });
        return glow;
    }

    private getElementColor(element: string): number {
        return COLORS.ELEMENTS[element as keyof typeof COLORS.ELEMENTS] || COLORS.ELEMENTS.neutral;
    }

    private getElementBorderColor(element: string): number {
        return COLORS.BORDERS[element as keyof typeof COLORS.BORDERS] || COLORS.BORDERS.neutral;
    }
}