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

    // Add subtle gradient overlay
    const gradient = this.createGradientOverlay();
    bg.addChild(gradient);

    // Board zones styling
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Enemy territory (top) - darker, more ominous
    const enemyZone = this.createBoardZone(
      'enemy',
      this.height * 0.20,
      this.height * 0.18
    );
    bg.addChild(enemyZone);

    // Player territory (bottom) - warmer, more inviting
    const playerZone = this.createBoardZone(
      'player',
      this.height * 0.50,
      this.height * 0.18
    );
    bg.addChild(playerZone);

    // Center battlefield line
    this.drawBattleLine(bg);

    // Decorative Celtic corners
    this.addCelticCorners(bg);

    // Ambient particles (optional visual flair)
    this.addAmbientEffects(bg);

    return bg;
  }

  private createGradientOverlay(): PIXI.Graphics {
    const overlay = new PIXI.Graphics();

    // Vignette effect
    const gradient = overlay.beginPath();

    // Dark edges
    overlay.circle(this.width / 2, this.height / 2, this.width * 0.6);
    overlay.fill({ color: 0x000000, alpha: 0 });

    overlay.rect(0, 0, this.width, this.height);
    overlay.fill({ color: 0x000000, alpha: 0.3 });

    return overlay;
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
      // Enemy zone - crimson/dark theme
      bg.fill({ color: 0x2d1810, alpha: 0.5 });
      bg.stroke({ width: 3, color: 0x8b4513 });

      // Inner glow
      bg.roundRect(marginLeft + 4, 4, boardWidth - 8, height - 8, 10);
      bg.stroke({ width: 2, color: 0xdc2626, alpha: 0.3 });
    } else {
      // Player zone - emerald/forest theme
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

    // Zone label
    const label = this.createZoneLabel(type);
    label.x = marginLeft + 10;
    label.y = 5;
    zone.addChild(label);

    return zone;
  }

  private createZonePattern(width: number, height: number, type: 'player' | 'enemy'): PIXI.Graphics {
    const pattern = new PIXI.Graphics();

    // Celtic knot-inspired pattern
    const spacing = 40;
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

  private createZoneLabel(type: 'player' | 'enemy'): PIXI.Text {
    const label = new PIXI.Text({
      text: type === 'enemy' ? ' Enemy Territory' : ' Your Territory',
      style: {
        fontSize: 12,
        fontWeight: 'bold',
        fill: type === 'enemy' ? 0xef4444 : 0x22c55e,
        stroke: { color: 0x000000, width: 3 },
      }
    });
    label.alpha = 0.7;
    return label;
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

  private addCelticCorners(bg: PIXI.Graphics): void {
    const cornerSize = 60;
    const positions = [
      { x: 20, y: 20 },                                  // Top-left
      { x: this.width - 20 - cornerSize, y: 20 },        // Top-right
      { x: 20, y: this.height - 20 - cornerSize },       // Bottom-left
      { x: this.width - 20 - cornerSize, y: this.height - 20 - cornerSize }, // Bottom-right
    ];

    positions.forEach(pos => {
      const corner = this.createCelticCorner(cornerSize);
      corner.x = pos.x;
      corner.y = pos.y;
      corner.alpha = 0.4;
      bg.addChild(corner);
    });
  }

  private createCelticCorner(size: number): PIXI.Graphics {
    const corner = new PIXI.Graphics();

    // Interlaced Celtic pattern
    const center = size / 2;

    // Outer circle
    corner.circle(center, center, center - 5);
    corner.stroke({ width: 3, color: 0xd4af37 });

    // Inner circles
    corner.circle(center, center, center - 15);
    corner.stroke({ width: 2, color: 0xfbbf24 });

    // Interwoven knots
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const x = center + (center - 20) * Math.cos(angle);
      const y = center + (center - 20) * Math.sin(angle);

      corner.circle(x, y, 8);
      corner.fill({ color: 0x1e293b, alpha: 0.8 });
      corner.stroke({ width: 2, color: 0xd4af37 });
    }

    return corner;
  }

  private addAmbientEffects(bg: PIXI.Graphics): void {
    // Subtle light rays from top
    for (let i = 0; i < 5; i++) {
      const x = (this.width / 6) * (i + 1);
      const ray = new PIXI.Graphics();

      ray.moveTo(x, 0);
      ray.lineTo(x - 50, this.height);
      ray.stroke({ width: 40, color: 0xffffff, alpha: 0.02 });

      bg.addChild(ray);
    }
  }

  // All existing position methods remain the same
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