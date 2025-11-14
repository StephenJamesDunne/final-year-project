import * as PIXI from 'pixi.js';
import { Card as CardType, Minion } from '@/lib/types/game';

export class CardRenderer {
  private textures: Map<string, PIXI.Texture> = new Map();
  private readonly CARD_WIDTH = 100;
  private readonly CARD_HEIGHT = 140;
  private loadingPromises: Map<string, Promise<PIXI.Texture>> = new Map();

  /**
   * Load card assets
   */
  async loadAssets(): Promise<void> {
    console.log('CardRenderer: Loading assets...');

    // Pre-load common textures
    try {
      // Card frame textures (you can create these as SVG or PNG assets)
      await this.loadTexture('card-frame', '/images/default/card-frame.png');
      await this.loadTexture('card-back', '/images/default/card-back.png');

      console.log('CardRenderer: Assets loaded successfully');
    } catch (error) {
      console.warn('CardRenderer: Some assets failed to load, using fallbacks', error);
    }
  }

  // This needs to return a Promise to handle async loading, otherwise, it might return before loading the texture
  private async loadTexture(key: string, path: string): Promise<PIXI.Texture> {
    if (this.textures.has(key)) {
      return this.textures.get(key)!;
    }

    // Check if we're already loading this texture. If so, return the existing promise
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!;
    }

    const loadPromise = PIXI.Assets.load(path).then((texture: PIXI.Texture) => {
      this.textures.set(key, texture);
      this.loadingPromises.delete(key);
      return texture;
    }).catch((error) => {
      console.warn(`Failed to load texture: ${path}`, error);
      this.loadingPromises.delete(key);
      // Return a placeholder texture
      const graphics = new PIXI.Graphics();
      graphics.rect(0, 0, 100, 100);
      graphics.fill(0x333333);
      const texture = PIXI.RenderTexture.create({ width: 100, height: 100 });
      return texture;
    });

    this.loadingPromises.set(key, loadPromise);
    return loadPromise;
  }

  /**
   * Create a card with actual artwork
   */
  createCard(card: CardType, showName: boolean = true): PIXI.Container {
    const container = new PIXI.Container();

    // Card base with shadow
    const shadow = this.createCardShadow();
    container.addChild(shadow);

    // Card background with gradient
    const bg = this.createCardBackground(card);
    container.addChild(bg);

    // Decorative frame overlay
    const frame = this.createCardFrame(card);
    container.addChild(frame);

    // Card name banner - only show if requested
    if (showName) {
      const nameBanner = this.createNameBanner(card.name);
      nameBanner.y = this.CARD_HEIGHT - 25; // Position at bottom
      container.addChild(nameBanner);
    }

    // Mana cost crystal
    const manaCost = this.createManaCrystal(card.manaCost);
    manaCost.x = -8;
    manaCost.y = -8;
    container.addChild(manaCost);

    // Stats for minions
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

    // Card shadow
    const shadow = this.createCardShadow();
    container.addChild(shadow);

    // Card art - no name on board cards
    if (minion.imageUrl) {
      this.loadCardArt(minion.imageUrl, container);
    } else {
      const placeholder = this.createArtPlaceholder(minion);
      container.addChild(placeholder);
    }

    // Frame overlay
    const frame = this.createCardFrame(minion);
    container.addChild(frame);

    // Attack badge
    const attackBadge = this.createAttackBadge(minion.attack);
    attackBadge.x = -8;
    attackBadge.y = this.CARD_HEIGHT - 20;
    container.addChild(attackBadge);

    // Health badge (shows current/max health)
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

    // Shadow
    const shadow = this.createCardShadow();
    container.addChild(shadow);

    // Background
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, 8);
    bg.fill({ color: 0x2d1810, alpha: 0.95 });
    bg.stroke({ width: 3, color: 0x8b4513 });
    container.addChild(bg);

    // Try to load card back texture
    const cardBackKey = 'card-back';
    if (this.textures.has(cardBackKey)) {
      const sprite = new PIXI.Sprite(this.textures.get(cardBackKey));
      sprite.width = this.CARD_WIDTH - 10;
      sprite.height = this.CARD_HEIGHT - 10;
      sprite.x = 5;
      sprite.y = 5;
      container.addChild(sprite);
    } else {
      // Celtic knot pattern as fallback
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

  private createCardShadow(): PIXI.Graphics {
    const shadow = new PIXI.Graphics();
    shadow.roundRect(2, 2, this.CARD_WIDTH, this.CARD_HEIGHT, 8);
    shadow.fill({ color: 0x000000, alpha: 0.4 });
    return shadow;
  }

  private createCardBackground(card: CardType | Minion, isPlayer?: boolean): PIXI.Graphics {
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, 8);

    // Different colors based on element or team
    let color = this.getElementColor(card.element);

    if ('instanceId' in card && isPlayer !== undefined) {
      // Add team tint for board minions
      color = isPlayer ? 0x1a472a : 0x7f1d1d;
    }

    bg.fill({ color, alpha: 0.9 });
    bg.stroke({ width: 3, color: this.getElementBorderColor(card.element) });

    return bg;
  }

  private async loadCardArt(imageUrl: string, container: PIXI.Container): Promise<void> {
    try {
      const texture = await this.loadTexture(imageUrl, imageUrl);

      // Create art container with clipping
      const artContainer = new PIXI.Container();
      artContainer.x = 8;
      artContainer.y = 30;

      const mask = new PIXI.Graphics();
      mask.roundRect(0, 0, this.CARD_WIDTH - 16, 70, 4);
      mask.fill(0xffffff);

      const sprite = new PIXI.Sprite(texture);
      sprite.width = this.CARD_WIDTH - 16;
      sprite.height = 70;

      artContainer.addChild(mask);
      artContainer.addChild(sprite);
      sprite.mask = mask;

      // Insert after background but before frame
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
    bg.fill({ color: 0x1e293b, alpha: 0.8 });
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

    // Ornate border
    frame.roundRect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, 8);
    frame.stroke({ width: 2, color: 0xd4af37, alpha: 0.6 });

    // Inner decorative lines
    frame.roundRect(4, 4, this.CARD_WIDTH - 8, this.CARD_HEIGHT - 8, 6);
    frame.stroke({ width: 1, color: 0xfbbf24, alpha: 0.3 });

    return frame;
  }

  private createNameBanner(name: string, compact: boolean = false): PIXI.Container {
    const banner = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.roundRect(5, 0, this.CARD_WIDTH - 10, 20, 4);
    bg.fill({ color: 0x1e293b, alpha: 0.95 });
    bg.stroke({ width: 1, color: 0xfbbf24 });
    banner.addChild(bg);

    const text = new PIXI.Text({
      text: name,
      style: {
        fontSize: compact ? 9 : 10,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 2 },
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
    const crystal = new PIXI.Container();

    // Hexagonal shape
    const hexagon = new PIXI.Graphics();
    const size = 16;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      points.push(
        size + size * Math.cos(angle),
        size + size * Math.sin(angle)
      );
    }
    hexagon.poly(points);
    hexagon.fill({ color: 0x3b82f6, alpha: 0.95 });
    hexagon.stroke({ width: 2, color: 0x1e40af });
    crystal.addChild(hexagon);

    const text = new PIXI.Text({
      text: cost.toString(),
      style: {
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 3 },
      }
    });
    text.x = size;
    text.y = size;
    text.anchor.set(0.5);
    crystal.addChild(text);

    return crystal;
  }

  private createAttackBadge(attack: number): PIXI.Container {
    const badge = new PIXI.Container();

    // Sword-shaped background
    const bg = new PIXI.Graphics();
    bg.circle(16, 16, 16);
    bg.fill({ color: 0xdc2626, alpha: 0.95 });
    bg.stroke({ width: 2, color: 0xfbbf24 });
    badge.addChild(bg);

    const text = new PIXI.Text({
      text: attack.toString(),
      style: {
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 3 },
      }
    });
    text.x = 16;
    text.y = 16;
    text.anchor.set(0.5);
    badge.addChild(text);

    return badge;
  }

  private createHealthBadge(health: number, isDamaged: boolean = false): PIXI.Container {
    const badge = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.circle(16, 16, 16);
    bg.fill({
      color: isDamaged ? 0xdc2626 : 0x16a34a,
      alpha: 0.95
    });
    bg.stroke({ width: 2, color: 0xfbbf24 });
    badge.addChild(bg);

    const text = new PIXI.Text({
      text: health.toString(),
      style: {
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 3 },
      }
    });
    text.x = 16;
    text.y = 16;
    text.anchor.set(0.5);
    badge.addChild(text);

    return badge;
  }

  private createCelticPattern(): PIXI.Graphics {
    const pattern = new PIXI.Graphics();

    // Simple Celtic knot representation
    pattern.circle(0, 0, 30);
    pattern.stroke({ width: 3, color: 0x8b4513 });

    pattern.circle(0, 0, 20);
    pattern.stroke({ width: 2, color: 0xd4af37 });

    // Interwoven effect
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const x = 15 * Math.cos(angle);
      const y = 15 * Math.sin(angle);
      pattern.circle(x, y, 8);
      pattern.fill({ color: 0x2d1810, alpha: 0.8 });
      pattern.stroke({ width: 2, color: 0xd4af37 });
    }

    return pattern;
  }

  createAttackGlow(): PIXI.Graphics {
    const glow = new PIXI.Graphics();
    glow.roundRect(-5, -5, this.CARD_WIDTH + 10, this.CARD_HEIGHT + 10, 10);
    glow.fill({ color: 0x22c55e, alpha: 0.3 });

    // Pulsing effect needs to added externally
    return glow;
  }

  createTargetGlow(): PIXI.Graphics {
    const glow = new PIXI.Graphics();
    glow.roundRect(-5, -5, this.CARD_WIDTH + 10, this.CARD_HEIGHT + 10, 10);
    glow.fill({ color: 0xef4444, alpha: 0.3 });
    return glow;
  }

  // Utility methods
  private getElementColor(element: string): number {
    const colors: Record<string, number> = {
      fire: 0xdc2626,
      water: 0x2563eb,
      earth: 0x16a34a,
      air: 0x9333ea,
      spirit: 0x4f46e5,
      neutral: 0x6b7280,
    };
    return colors[element] || 0x6b7280;
  }

  private getElementBorderColor(element: string): number {
    const colors: Record<string, number> = {
      fire: 0xfbbf24,
      water: 0x60a5fa,
      earth: 0x4ade80,
      air: 0xc084fc,
      spirit: 0x818cf8,
      neutral: 0x9ca3af,
    };
    return colors[element] || 0x9ca3af;
  }
}