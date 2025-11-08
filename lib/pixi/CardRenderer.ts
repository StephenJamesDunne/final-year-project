import * as PIXI from 'pixi.js';
import { Card as CardType, Minion } from '@/lib/types/game';

export class CardRenderer {
  private textures: Map<string, PIXI.Texture> = new Map();
  private readonly CARD_WIDTH = 100;
  private readonly CARD_HEIGHT = 140;

  /**
   * Load card assets (placeholder for now)
   */
  async loadAssets(): Promise<void> {
    // For now, I'm using procedural graphics
    // Later, load actual card images here
    console.log('CardRenderer: Assets loaded (using procedural graphics)');
  }

  /**
   * Create a card from CardType (for hand)
   */
  createCard(card: CardType): PIXI.Container {
    const container = new PIXI.Container();

    // Card background
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, 8);
    
    // Color based on cost
    const color = this.getCardColor(card.manaCost);
    bg.fill({ color, alpha: 0.9 });
    bg.stroke({ width: 2, color: 0xfbbf24 });
    
    container.addChild(bg);

    // Card name
    const nameText = new PIXI.Text({
      text: card.name,
      style: {
        fontSize: 12,
        fontWeight: 'bold',
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: this.CARD_WIDTH - 10,
        align: 'center',
      },
    });
    nameText.x = this.CARD_WIDTH / 2;
    nameText.y = 10;
    nameText.anchor.set(0.5, 0);
    container.addChild(nameText);

    // Mana cost badge
    const manaCost = this.createManaBadge(card.manaCost);
    manaCost.x = 5;
    manaCost.y = 5;
    container.addChild(manaCost);

    // Stats (if minion)
    if (card.type === 'minion' && card.attack !== undefined && card.health !== undefined) {
      const stats = this.createStats(card.attack, card.health);
      stats.y = this.CARD_HEIGHT - 25;
      container.addChild(stats);
    }

    return container;
  }

  /**
   * Create a minion card (for board)
   */
  createMinionCard(minion: Minion, isPlayer: boolean): PIXI.Container {
    const container = new PIXI.Container();

    // Card background
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, 8);
    
    // Different color for player/AI
    const color = isPlayer ? 0x10b981 : 0xef4444;
    bg.fill({ color, alpha: 0.8 });
    bg.stroke({ width: 2, color: 0xfbbf24 });
    
    container.addChild(bg);

    // Minion name
    const nameText = new PIXI.Text({
      text: minion.name,
      style: {
        fontSize: 11,
        fontWeight: 'bold',
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: this.CARD_WIDTH - 10,
        align: 'center',
      },
    });
    nameText.x = this.CARD_WIDTH / 2;
    nameText.y = 10;
    nameText.anchor.set(0.5, 0);
    container.addChild(nameText);

    // Stats
    const stats = this.createStats(minion.attack, minion.currentHealth, minion.health);
    stats.y = this.CARD_HEIGHT - 25;
    container.addChild(stats);

    // "Can Attack" indicator
    if (minion.canAttack) {
      const indicator = new PIXI.Graphics();
      indicator.circle(this.CARD_WIDTH / 2, this.CARD_HEIGHT / 2, 8);
      indicator.fill({ color: 0x22c55e, alpha: 0.7 });
      container.addChild(indicator);
    }

    return container;
  }

  /**
   * Create card back (for AI hand)
   */
  createCardBack(): PIXI.Container {
    const container = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, 8);
    bg.fill({ color: 0x334155, alpha: 0.9 });
    bg.stroke({ width: 2, color: 0x64748b });

    container.addChild(bg);

    // Celtic pattern placeholder for cardbacks TODO: Replace with actual texture
    const pattern = new PIXI.Text({
      text: '🍀',
      style: { fontSize: 40 },
    });
    pattern.x = this.CARD_WIDTH / 2;
    pattern.y = this.CARD_HEIGHT / 2;
    pattern.anchor.set(0.5);
    container.addChild(pattern);

    return container;
  }

  /**
   * Create attack glow effect
   */
  createAttackGlow(): PIXI.Graphics {
    const glow = new PIXI.Graphics();
    glow.roundRect(-5, -5, this.CARD_WIDTH + 10, this.CARD_HEIGHT + 10, 10);
    glow.fill({ color: 0x22c55e, alpha: 0.3 });
    return glow;
  }

  /**
   * Create target glow effect
   */
  createTargetGlow(): PIXI.Graphics {
    const glow = new PIXI.Graphics();
    glow.roundRect(-5, -5, this.CARD_WIDTH + 10, this.CARD_HEIGHT + 10, 10);
    glow.fill({ color: 0xef4444, alpha: 0.3 });
    return glow;
  }

  // Helper methods

  private createManaBadge(cost: number): PIXI.Container {
    const badge = new PIXI.Container();

    const circle = new PIXI.Graphics();
    circle.circle(12, 12, 12);
    circle.fill(0x3b82f6);
    circle.stroke({ width: 2, color: 0x1e40af });
    badge.addChild(circle);

    const text = new PIXI.Text({
      text: cost.toString(),
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xffffff,
      },
    });
    text.x = 12;
    text.y = 12;
    text.anchor.set(0.5);
    badge.addChild(text);

    return badge;
  }

  private createStats(attack: number, currentHealth: number, maxHealth?: number): PIXI.Container {
    const stats = new PIXI.Container();

    // Attack (left)
    const attackBg = new PIXI.Graphics();
    attackBg.circle(20, 12, 12);
    attackBg.fill(0xef4444);
    attackBg.stroke({ width: 2, color: 0x991b1b });
    stats.addChild(attackBg);

    const attackText = new PIXI.Text({
      text: attack.toString(),
      style: { fontSize: 14, fontWeight: 'bold', fill: 0xffffff },
    });
    attackText.x = 20;
    attackText.y = 12;
    attackText.anchor.set(0.5);
    stats.addChild(attackText);

    // Health (right)
    const healthBg = new PIXI.Graphics();
    healthBg.circle(80, 12, 12);
    
    // Red if damaged, green if full health
    const healthColor = maxHealth && currentHealth < maxHealth ? 0xf59e0b : 0x10b981;
    healthBg.fill(healthColor);
    healthBg.stroke({ width: 2, color: 0x065f46 });
    stats.addChild(healthBg);

    const healthText = new PIXI.Text({
      text: currentHealth.toString(),
      style: { fontSize: 14, fontWeight: 'bold', fill: 0xffffff },
    });
    healthText.x = 80;
    healthText.y = 12;
    healthText.anchor.set(0.5);
    stats.addChild(healthText);

    return stats;
  }

  private getCardColor(cost: number): number {
    if (cost <= 2) return 0x6366f1; // Indigo
    if (cost <= 4) return 0x8b5cf6; // Violet
    if (cost <= 6) return 0xa855f7; // Purple
    return 0xc026d3; // Fuchsia
  }
}