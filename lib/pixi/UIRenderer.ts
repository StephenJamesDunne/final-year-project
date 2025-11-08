import * as PIXI from 'pixi.js';

export class UIRenderer {
  /**
   * Create Hearthstone-style hero portrait with health/mana
   */
  createHeroPortrait(
    health: number,
    mana: number,
    maxMana: number,
    name: string,
    isAI: boolean
  ): PIXI.Container {
    const container = new PIXI.Container();

    // Portrait frame (circular, like Hearthstone)
    const portraitSize = 120;
    const frame = new PIXI.Graphics();
    
    // Outer border (gold/bronze)
    frame.circle(portraitSize / 2, portraitSize / 2, portraitSize / 2);
    frame.fill({ color: isAI ? 0xcc3333 : 0x3366cc, alpha: 0.3 });
    frame.stroke({ width: 4, color: 0xd4af37 });
    
    container.addChild(frame);

    // Name banner (top)
    const nameBg = new PIXI.Graphics();
    nameBg.roundRect(10, 5, portraitSize - 20, 25, 5);
    nameBg.fill({ color: 0x1e293b, alpha: 0.9 });
    container.addChild(nameBg);

    const nameText = new PIXI.Text({
      text: name,
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        fill: isAI ? 0xef4444 : 0x3b82f6,
        align: 'center',
      },
    });
    nameText.x = portraitSize / 2;
    nameText.y = 12;
    nameText.anchor.set(0.5, 0);
    container.addChild(nameText);

    // Health gem (bottom center - Hearthstone style)
    const healthGem = this.createStatGem(health, 0xef4444, '❤️');
    healthGem.x = portraitSize / 2 - 30;
    healthGem.y = portraitSize - 20;
    container.addChild(healthGem);

    // Mana gem (bottom right)
    const manaText = `${mana}/${maxMana}`;
    const manaGem = this.createStatGem(manaText, 0x3b82f6, '💎');
    manaGem.x = portraitSize / 2 + 10;
    manaGem.y = portraitSize - 20;
    container.addChild(manaGem);

    return container;
  }

  /**
   * Create stat gem (health/mana display)
   */
  private createStatGem(value: number | string, color: number, icon: string): PIXI.Container {
    const gem = new PIXI.Container();

    // Gem background
    const bg = new PIXI.Graphics();
    bg.circle(20, 20, 20);
    bg.fill(color);
    bg.stroke({ width: 3, color: 0xfbbf24 });
    gem.addChild(bg);

    // Value text
    const text = new PIXI.Text({
      text: value.toString(),
      style: {
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 3 },
      },
    });
    text.x = 20;
    text.y = 20;
    text.anchor.set(0.5);
    gem.addChild(text);

    return gem;
  }

  /**
   * Create deck indicator (card back with count)
   */
  createDeckIndicator(cardCount: number, isAI: boolean): PIXI.Container {
    const container = new PIXI.Container();

    // Deck card back
    const deckBg = new PIXI.Graphics();
    deckBg.roundRect(0, 0, 80, 112, 8);
    deckBg.fill({ color: 0x334155, alpha: 0.9 });
    deckBg.stroke({ width: 2, color: 0x64748b });
    container.addChild(deckBg);

    // Celtic pattern placeholder
    const pattern = new PIXI.Text({
      text: '🍀',
      style: { fontSize: 30 },
    });
    pattern.x = 40;
    pattern.y = 40;
    pattern.anchor.set(0.5);
    container.addChild(pattern);

    // Card count badge
    const countBadge = new PIXI.Graphics();
    countBadge.circle(40, 90, 18);
    countBadge.fill(0x1e293b);
    countBadge.stroke({ width: 2, color: 0xfbbf24 });
    container.addChild(countBadge);

    const countText = new PIXI.Text({
      text: cardCount.toString(),
      style: {
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff,
      },
    });
    countText.x = 40;
    countText.y = 90;
    countText.anchor.set(0.5);
    container.addChild(countText);

    return container;
  }

  /**
   * Create End Turn button
   */
  createEndTurnButton(enabled: boolean): PIXI.Container {
    const button = new PIXI.Container();

    // Circular button
    const bg = new PIXI.Graphics();
    bg.circle(60, 60, 60);
    
    if (enabled) {
      bg.fill({ color: 0x10b981, alpha: 0.9 });
      bg.stroke({ width: 4, color: 0xfbbf24 });
      button.eventMode = 'static';
      button.cursor = 'pointer';
    } else {
      bg.fill({ color: 0x64748b, alpha: 0.5 });
      bg.stroke({ width: 4, color: 0x475569 });
    }
    
    button.addChild(bg);

    // Text
    const text = new PIXI.Text({
      text: 'END\nTURN',
      style: {
        fontSize: 16,
        fontWeight: 'bold',
        fill: enabled ? 0xffffff : 0x94a3b8,
        align: 'center',
        lineHeight: 20,
      },
    });
    text.x = 60;
    text.y = 60;
    text.anchor.set(0.5);
    button.addChild(text);

    // Hover effect
    if (enabled) {
      button.on('pointerover', () => {
        bg.clear();
        bg.circle(60, 60, 60);
        bg.fill({ color: 0x059669, alpha: 1 });
        bg.stroke({ width: 5, color: 0xfde047 });
      });
      
      button.on('pointerout', () => {
        bg.clear();
        bg.circle(60, 60, 60);
        bg.fill({ color: 0x10b981, alpha: 0.9 });
        bg.stroke({ width: 4, color: 0xfbbf24 });
      });
    }

    return button;
  }

  /**
   * Create combat log
   */
  createCombatLog(combatLog: string[], aiAction?: string): PIXI.Container {
    const container = new PIXI.Container();

    // Compact background
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 250, 300, 8);
    bg.fill({ color: 0x1e293b, alpha: 0.7 });
    bg.stroke({ width: 2, color: 0x475569 });
    container.addChild(bg);

    // Title
    const title = new PIXI.Text({
      text: 'Combat Log',
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xfbbf24,
      },
    });
    title.x = 125;
    title.y = 8;
    title.anchor.set(0.5, 0);
    container.addChild(title);

    // Recent logs (last 8)
    const recentLogs = combatLog.slice(-8).reverse();
    recentLogs.forEach((log, i) => {
      const logText = new PIXI.Text({
        text: `• ${log}`,
        style: {
          fontSize: 10,
          fill: 0xe2e8f0,
          wordWrap: true,
          wordWrapWidth: 230,
        },
      });
      logText.x = 10;
      logText.y = 30 + i * 32;
      container.addChild(logText);
    });

    return container;
  }

  /**
   * Create turn indicator (simple corner badge)
   */
  createTurnIndicator(turnNumber: number, currentTurn: 'player' | 'ai'): PIXI.Container {
    const container = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 120, 50, 8);
    bg.fill({ color: 0x1e293b, alpha: 0.9 });
    bg.stroke({ width: 2, color: currentTurn === 'player' ? 0x10b981 : 0xef4444 });
    container.addChild(bg);

    const turnText = new PIXI.Text({
      text: `Turn ${turnNumber}`,
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xfbbf24,
      },
    });
    turnText.x = 60;
    turnText.y = 12;
    turnText.anchor.set(0.5, 0);
    container.addChild(turnText);

    const playerText = new PIXI.Text({
      text: currentTurn === 'player' ? 'Your Turn' : 'AI Turn',
      style: {
        fontSize: 11,
        fill: currentTurn === 'player' ? 0x10b981 : 0xef4444,
      },
    });
    playerText.x = 60;
    playerText.y = 30;
    playerText.anchor.set(0.5, 0);
    container.addChild(playerText);

    return container;
  }

  /**
   * Legacy method - now redirects to createHeroPortrait
   */
  createHealthDisplay(
    health: number,
    mana: number,
    maxMana: number,
    name: string,
    isAI: boolean
  ): PIXI.Container {
    return this.createHeroPortrait(health, mana, maxMana, name, isAI);
  }
}