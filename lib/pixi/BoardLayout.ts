import * as PIXI from 'pixi.js';

interface Position {
  x: number;
  y: number;
}

export class BoardLayout {
  private width: number;
  private height: number;

  constructor(width = 1920, height = 1080) {
    this.width = width;
    this.height = height;
  }

  updateDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  createBackground(): PIXI.Graphics {
    const bg = new PIXI.Graphics();

    // Main background
    bg.rect(0, 0, this.width, this.height);
    bg.fill(0x0f172a);

    // Hearthstone-style board zones
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Enemy board zone, top third of the screen
    const enemyBoardY = this.height * 0.20;
    const enemyBoardHeight = this.height * 0.18;
    const boardWidth = this.width * 0.65;
    const boardMarginLeft = (this.width - boardWidth) / 2;

    bg.rect(boardMarginLeft, enemyBoardY, boardWidth, enemyBoardHeight);
    bg.fill({ color: 0x2d1810, alpha: 0.4 });
    bg.stroke({ width: 2, color: 0x8b4513 });

    // Player board zone (middle) - mirror of enemy
    const playerBoardY = this.height * 0.50;
    const playerBoardHeight = this.height * 0.18;

    bg.rect(boardMarginLeft, playerBoardY, boardWidth, playerBoardHeight);
    bg.fill({ color: 0x1a3a1a, alpha: 0.4 });
    bg.stroke({ width: 2, color: 0x2d5a2d });

    // Center divider line (between portraits)
    const dividerY = this.height * 0.44;
    bg.moveTo(boardMarginLeft, dividerY);
    bg.lineTo(boardMarginLeft + boardWidth, dividerY);
    bg.stroke({ width: 2, color: 0x64748b, alpha: 0.5 });

    return bg;
  }

  /**
   * AI hand positions (top center, tight spacing for just the card backs)
   */
  getAIHandPositions(count: number): Position[] {
    if (count === 0) return [];

    const y = this.height * 0.0001;
    const spacing = 45;
    const centerX = this.width / 3;
    const totalWidth = (count - 1) * spacing;
    const startX = centerX - totalWidth / 2;

    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * spacing,
      y,
    }));
  }

  /**
   * AI board minions (centered in enemy board zone)
   */
  getAIBoardPositions(count: number): Position[] {
    if (count === 0) return [];

    const y = this.height * 0.26;
    const spacing = 130;
    const centerX = this.width / 2;
    const totalWidth = (count - 1) * spacing;
    const startX = centerX - totalWidth / 2;

    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * spacing,
      y,
    }));
  }

  /**
   * Player board minions (centered in player board zone)
   */
  getPlayerBoardPositions(count: number): Position[] {
    if (count === 0) return [];

    const y = this.height * 0.515;
    const spacing = 130;
    const centerX = this.width / 2;
    const totalWidth = (count - 1) * spacing;
    const startX = centerX - totalWidth / 2;

    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * spacing,
      y,
    }));
  }

  /**
   * Player hand (curved arc at bottom similar to Hearthstone)
   */
  getPlayerHandPositions(count: number): Position[] {
    if (count === 0) return [];

    const baseY = this.height * 0.85; // Near bottom
    const centerX = this.width / 2;
    const cardWidth = 100;
    const maxCards = 10;

    // Spacing gets tighter with more cards in hand
    const spacing = count <= 7 ? 115 : Math.min(115, (this.width * 0.6) / count);
    const totalWidth = (count - 1) * spacing;
    const startX = centerX - totalWidth / 2;

    // Create slight arc
    // TODO: Better centering logic for odd/even counts
    // so that player hand is always centered under portrait
    return Array.from({ length: count }, (_, i) => {
      const progress = count > 1 ? i / (count - 1) : 0.5;
      const xPos = startX + i * spacing;

      // Gentle parabolic curve
      const curveAmount = 25;
      const yOffset = curveAmount * Math.pow(2 * progress - 1, 2) - curveAmount;

      return {
        x: xPos,
        y: baseY + yOffset,
      };
    });
  }

  /**
   * AI portrait (Hearthstone: top center)
   */
  getAIPortraitPosition(): Position {
    return {
      x: this.width / 2 - 75, // Centered (150px portrait width)
      y: this.height * 0.05,
    };
  }

  /**
   * Player portrait (Hearthstone: bottom center)
   */
  getPlayerPortraitPosition(): Position {
    return {
      x: this.width / 2 - 75, // Centered (150px portrait width)
      y: this.height * 0.68,
    };
  }

  /**
   * AI deck position (top right)
   */
  getAIDeckPosition(): Position {
    return {
      x: this.width * 0.90,
      y: this.height * 0.06,
    };
  }

  /**
   * Player deck position (bottom right)
   */
  getPlayerDeckPosition(): Position {
    return {
      x: this.width * 0.90,
      y: this.height * 0.72,
    };
  }

  /**
   * End turn button (right-middle of the screen)
   */
  getEndTurnButtonPosition(): Position {
    return {
      x: this.width * 0.83,
      y: this.height / 3 + 40, // Centered vertically
    };
  }

  /**
   * Turn indicator (top left corner)
   */
  getTurnIndicatorPosition(): Position {
    return {
      x: this.width * 0.02,
      y: this.height * 0.02,
    };
  }

  /**
   * Combat log (TODO: needs to be more prominent)
   */
  getCombatLogPosition(): Position {
    return {
      x: this.width * 0.02,
      y: this.height * 0.40, // Left side, middle
    };
  }

  /**
   * Helper: Get AI health display (integrated with portrait)
   */
  getAIHealthPosition(): Position {
    return this.getAIPortraitPosition();
  }

  /**
   * Helper: Get player health display (integrated with portrait)
   */
  getPlayerHealthPosition(): Position {
      return this.getPlayerPortraitPosition();
    }

  private getCenteredCardPositions(
    count: number,
    y: number,
    spacing: number,
    maxWidth: number
  ): Position[] {
    if (count === 0) return [];

    const totalWidth = (count - 1) * spacing;
    const startX = (this.width - totalWidth) / 2;

    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * spacing,
      y,
    }));
  }
}