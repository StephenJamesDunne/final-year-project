import * as PIXI from 'pixi.js';

/**
 * Handles rendering of UI elements (health, mana, buttons, log)
 */
export class UIRenderer {
  /**
   * Create health and mana display
   */
  createHealthDisplay(
    health: number,
    mana: number,
    maxMana: number,
    label: string,
    isAI: boolean = false
  ): PIXI.Container {
    const container = new PIXI.Container();

    // Background
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 200, 120, 15);
    bg.fill({ color: isAI ? 0x4a1a1a : 0x1a1a4a, alpha: 0.9 });
    bg.stroke({ width: 3, color: isAI ? 0x8b0000 : 0x1e40af });
    container.addChild(bg);

    // Label
    const labelText = new PIXI.Text({
      text: label,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xcccccc,
      }
    });
    labelText.x = 10;
    labelText.y = 5;
    container.addChild(labelText);

    // Health icon
    const healthIcon = new PIXI.Text({
      text: '❤️',
      style: { fontSize: 24 }
    });
    healthIcon.x = 20;
    healthIcon.y = 20;
    container.addChild(healthIcon);

    // Health text
    const healthText = new PIXI.Text({
      text: health.toString(),
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 28,
        fontWeight: 'bold',
        fill: 0xffffff,
      }
    });
    healthText.x = 55;
    healthText.y = 18;
    container.addChild(healthText);

    // Mana crystals container
    const manaContainer = new PIXI.Container();
    manaContainer.x = 20;
    manaContainer.y = 70;

    for (let i = 0; i < maxMana; i++) {
      const crystal = new PIXI.Graphics();
      crystal.circle(0, 0, 8);
      crystal.fill({ color: i < mana ? 0x60a5fa : 0x374151 });
      crystal.stroke({ width: 2, color: 0x1e40af });
      crystal.x = i * 20;
      manaContainer.addChild(crystal);
    }

    container.addChild(manaContainer);

    // Mana text
    const manaText = new PIXI.Text({
      text: `${mana}/${maxMana}`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0x60a5fa,
      }
    });
    manaText.x = maxMana * 20 + 30;
    manaText.y = 65;
    manaContainer.addChild(manaText);

    return container;
  }

  /**
   * Create end turn button
   */
  createEndTurnButton(enabled: boolean): PIXI.Container {
    const container = new PIXI.Container();

    const button = new PIXI.Graphics();
    button.roundRect(0, 0, 160, 50, 10);
    button.fill({ color: enabled ? 0xf59e0b : 0x374151 });
    button.stroke({ width: 2, color: enabled ? 0xfbbf24 : 0x6b7280 });
    container.addChild(button);

    const text = new PIXI.Text({
      text: 'End Turn',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: enabled ? 0xffffff : 0x9ca3af,
      }
    });
    text.anchor.set(0.5);
    text.x = 80;
    text.y = 25;
    container.addChild(text);

    if (enabled) {
      container.eventMode = 'static';
      container.cursor = 'pointer';
    }

    return container;
  }

  /**
   * Create combat log
   */
  createCombatLog(combatLog: string[], aiAction?: string): PIXI.Container {
    const container = new PIXI.Container();

    // Background
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 350, 400, 10);
    bg.fill({ color: 0x1a1a2a, alpha: 0.95 });
    bg.stroke({ width: 2, color: 0xfbbf24 });
    container.addChild(bg);

    // Header
    const header = new PIXI.Graphics();
    header.roundRect(0, 0, 350, 40, 10);
    header.fill({ color: 0xf59e0b });
    container.addChild(header);

    const headerText = new PIXI.Text({
      text: 'Combat Log',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff,
      }
    });
    headerText.anchor.set(0.5);
    headerText.x = 175;
    headerText.y = 20;
    container.addChild(headerText);

    // Log entries
    const logContainer = new PIXI.Container();
    logContainer.x = 10;
    logContainer.y = 50;

    const recentLogs = combatLog.slice(-12);
    recentLogs.forEach((log, index) => {
      const logText = new PIXI.Text({
        text: log,
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          fill: 0x10b981,
          wordWrap: true,
          wordWrapWidth: 330,
        }
      });
      logText.y = index * 25;
      logContainer.addChild(logText);
    });

    // AI Action
    if (aiAction) {
      const aiText = new PIXI.Text({
        text: `AI: ${aiAction}`,
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          fill: 0xfbbf24,
          fontStyle: 'italic',
          wordWrap: true,
          wordWrapWidth: 330,
        }
      });
      aiText.y = recentLogs.length * 25 + 10;
      logContainer.addChild(aiText);
    }

    container.addChild(logContainer);
    return container;
  }

  /**
   * Create turn indicator
   */
  createTurnIndicator(turnNumber: number, currentTurn: 'player' | 'ai'): PIXI.Text {
    return new PIXI.Text({
      text: `Turn ${Math.ceil(turnNumber / 2)} - ${currentTurn === 'player' ? 'Your Turn' : 'AI Turn'}`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fill: 0xfbbf24,
        fontWeight: 'bold',
      }
    });
  }
}