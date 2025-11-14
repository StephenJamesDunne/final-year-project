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

    // Base background - dark fantasy theme
    bg.rect(0, 0, this.width, this.height);
    bg.fill(0x0a0e1a);

    // Enemy territory (top)
    const enemyZone = this.createBoardZone(
      'enemy',
      this.height * 0.20,
      this.height * 0.18
    );
    bg.addChild(enemyZone);

    // Player territory (bottom)
    const playerZone = this.createBoardZone(
      'player',
      this.height * 0.50,
      this.height * 0.18
    );
    bg.addChild(playerZone);

    // Center battlefield line
    this.drawBattleLine(bg);

    return bg;
  }

  private createBoardZone(type: 'player' | 'enemy', y: number, height: number): PIXI.Container {
    const zone = new PIXI.Container();
    zone.y = y;

    const boardWidth = this.width * 0.65;
    const marginLeft = (this.width - boardWidth) / 2;

    // Main zone background
    const bg = new PIXI.Graphics();
    bg.roundRect(marginLeft, 0, boardWidth, height, 12);

    if (type === 'enemy') {
      // Enemy zone - dark theme
      bg.fill({ color: 0x2d1810, alpha: 0.5 });
      bg.stroke({ width: 3, color: 0x8b4513 });

      // Inner glow
      bg.roundRect(marginLeft + 4, 4, boardWidth - 8, height - 8, 10);
      bg.stroke({ width: 2, color: 0xdc2626, alpha: 0.3 });
    } else {
      // Player zone - forest theme
      bg.fill({ color: 0x1a3a1a, alpha: 0.5 });
      bg.stroke({ width: 3, color: 0x2d5a2d });

      // Inner glow
      bg.roundRect(marginLeft + 4, 4, boardWidth - 8, height - 8, 10);
      bg.stroke({ width: 2, color: 0x22c55e, alpha: 0.3 });
    }

    zone.addChild(bg);

    // Decorative pattern overlay
    const pattern = this.createZonePattern(boardWidth, height, type);
    pattern.x = marginLeft;
    pattern.alpha = 0.1;
    zone.addChild(pattern);

    return zone;
  }

  private createZonePattern(width: number, height: number, type: 'player' | 'enemy'): PIXI.Graphics {
    const pattern = new PIXI.Graphics();

    // Celtic knot-inspired pattern
    const spacing = 40;
    // color is red for enemy, green for player
    const color = type === 'enemy' ? 0xff0000 : 0x00ff00;

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        // Small decorative diamonds
        pattern.moveTo(x + spacing / 2, y);
        pattern.lineTo(x + spacing, y + spacing / 2);
        pattern.lineTo(x + spacing / 2, y + spacing);
        pattern.lineTo(x, y + spacing / 2);
        pattern.lineTo(x + spacing / 2, y);
        pattern.stroke({ width: 1, color, alpha: 0.3 });
      }
    }

    return pattern;
  }

  private drawBattleLine(bg: PIXI.Graphics): void {
    const boardWidth = this.width * 0.65;
    const marginLeft = (this.width - boardWidth) / 2;
    const dividerY = this.height * 0.44;

    // Main battle line
    bg.moveTo(marginLeft, dividerY);
    bg.lineTo(marginLeft + boardWidth, dividerY);
    bg.stroke({ width: 3, color: 0xfbbf24, alpha: 0.6 });

    // Decorative dots along the line
    for (let x = marginLeft + 50; x < marginLeft + boardWidth; x += 50) {
      bg.circle(x, dividerY, 4);
      bg.fill({ color: 0xfbbf24, alpha: 0.8 });
    }
  }

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

  getAIBoardPositions(count: number): Position[] {
    if (count === 0) return [];

    // y = height 
    const y = this.height * 0.22;
    const spacing = 130;
    const centerX = this.width / 2;
    const totalWidth = (count - 1) * spacing;
    const startX = centerX - totalWidth / 2;
    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * spacing,
      y,
    }));
  }

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

  getPlayerHandPositions(count: number): Position[] {
    if (count === 0) return [];
    const baseY = this.height * 0.85;
    const centerX = this.width / 2;
    const spacing = count <= 7 ? 115 : Math.min(115, (this.width * 0.6) / count);
    const totalWidth = (count - 1) * spacing;
    const startX = centerX - totalWidth / 2;

    return Array.from({ length: count }, (_, i) => {
      const progress = count > 1 ? i / (count - 1) : 0.5;
      const xPos = startX + i * spacing;
      const curveAmount = 25;
      const yOffset = curveAmount * Math.pow(2 * progress - 1, 2) - curveAmount;
      return { x: xPos, y: baseY + yOffset };
    });
  }

  getAIPortraitPosition(): Position {
    return { x: this.width / 2 - 75, y: this.height * 0.05 };
  }

  getPlayerPortraitPosition(): Position {
    return { x: this.width / 2 - 75, y: this.height * 0.68 };
  }

  getAIDeckPosition(): Position {
    return { x: this.width * 0.90, y: this.height * 0.06 };
  }

  getPlayerDeckPosition(): Position {
    return { x: this.width * 0.90, y: this.height * 0.72 };
  }

  getEndTurnButtonPosition(): Position {
    return { x: this.width * 0.83, y: this.height / 3 + 40 };
  }

  getTurnIndicatorPosition(): Position {
    return { x: this.width * 0.02, y: this.height * 0.02 };
  }

  getCombatLogPosition(): Position {
    return { x: this.width * 0.02, y: this.height * 0.40 };
  }

  getAIHealthPosition(): Position {
    return this.getAIPortraitPosition();
  }

  getPlayerHealthPosition(): Position {
    return this.getPlayerPortraitPosition();
  }
}