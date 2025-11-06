import * as PIXI from 'pixi.js';

const CARD_WIDTH = 120;
const CARD_HEIGHT = 160;
const CARD_SPACING = 15;

const BOARD_WIDTH = 1400;
const BOARD_HEIGHT = 900;

interface Position {
  x: number;
  y: number;
}

/**
 * Handles all layout calculations for the game board
 */
export class BoardLayout {
  /**
   * Create the background graphics with zones
   */
  createBackground(): PIXI.Container {
    const container = new PIXI.Container();

    // Main background
    const mainBg = new PIXI.Graphics();
    mainBg.rect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    mainBg.fill({ color: 0x0f172a });
    container.addChild(mainBg);

    // AI Board Zone
    const aiZone = new PIXI.Graphics();
    aiZone.roundRect(50, 100, 1300, 200, 15);
    aiZone.fill({ color: 0x1a1a2a, alpha: 0.6 });
    aiZone.stroke({ width: 3, color: 0x4a4a5a });
    container.addChild(aiZone);

    // Player Board Zone
    const playerZone = new PIXI.Graphics();
    playerZone.roundRect(50, 500, 1300, 200, 15);
    playerZone.fill({ color: 0x2a1a1a, alpha: 0.6 });
    playerZone.stroke({ width: 3, color: 0x5a4a4a });
    container.addChild(playerZone);

    // Center battlefield divider
    const divider = new PIXI.Graphics();
    divider.rect(0, 430, BOARD_WIDTH, 8);
    divider.fill({ color: 0x6b7280 });
    container.addChild(divider);

    // Title
    const title = new PIXI.Text({
      text: 'Five Realms',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 36,
        fontWeight: 'bold',
        fill: 0xfbbf24,
        stroke: { color: 0x92400e, width: 2 },
      }
    });
    title.anchor.set(0.5, 0);
    title.x = BOARD_WIDTH / 2;
    title.y = 20;
    container.addChild(title);

    return container;
  }

  /**
   * Calculate positions for AI hand cards
   */
  getAIHandPositions(count: number): Position[] {
    const cardWidth = 80;
    const totalWidth = count * (cardWidth + 10);
    const startX = (BOARD_WIDTH - totalWidth) / 2;
    const y = 10;

    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * (cardWidth + 10),
      y,
    }));
  }

  /**
   * Calculate positions for AI board minions
   */
  getAIBoardPositions(count: number): Position[] {
    const totalWidth = count * (CARD_WIDTH + CARD_SPACING);
    const startX = (BOARD_WIDTH - totalWidth) / 2;
    const y = 120;

    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * (CARD_WIDTH + CARD_SPACING),
      y,
    }));
  }

  /**
   * Calculate positions for player board minions
   */
  getPlayerBoardPositions(count: number): Position[] {
    const totalWidth = count * (CARD_WIDTH + CARD_SPACING);
    const startX = (BOARD_WIDTH - totalWidth) / 2;
    const y = 520;

    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * (CARD_WIDTH + CARD_SPACING),
      y,
    }));
  }

  /**
   * Calculate positions for player hand cards
   */
  getPlayerHandPositions(count: number): Position[] {
    const totalWidth = count * (CARD_WIDTH + CARD_SPACING);
    const startX = (BOARD_WIDTH - totalWidth) / 2;
    const y = 720;

    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * (CARD_WIDTH + CARD_SPACING),
      y,
    }));
  }
}