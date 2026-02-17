import * as PIXI from 'pixi.js';
import { COLORS } from '../utils/StyleConstants';

// BoardLayout provides all the math logic for positioning of my PIXI elements on the screen. 
// This is where all elements on the canvas are anchored to their positions on the page.

// Stores current screen dimensions
// Calculates positions for all game elements
// Create background graphics

// All positions use percentages of screen size
// Responsive to window resize
// Centers elements horizontally
// Divides screen into zones, vertically


interface Position {
  x: number;
  y: number;
}

export class BoardLayout {
  private width: number;
  private height: number;

  // Cache for storing calculated positions of elements on the board
  private positionCache: Map<string, Position[]> = new Map();

  constructor(width = 1920, height = 1080) {
    this.width = width;
    this.height = height;
  }

  // Update dimensions and clear cache when screen resizes
  updateDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.positionCache.clear();
  }

  // Create complete background graphics
  // Layers:
  // Base background colour
  // Enemy board zone (top of screen)
  // Player board zone (bottom of screen)
  // Center battlefield divider line
  createBackground(): PIXI.Graphics {
    const bg = new PIXI.Graphics();

    // Base background - dark fantasy theme
    bg.rect(0, 0, this.width, this.height);
    bg.fill(COLORS.UI.baseBG);

    // Enemy territory (top third)
    const enemyZone = this.createBoardZone(
      'enemy',
      this.height * 0.20, // Y position (20% down from very top of screen)
      this.height * 0.18  // Height (18% of screen)
    );
    bg.addChild(enemyZone);

    // Player territory (middle of screen)
    const playerZone = this.createBoardZone(
      'player',
      this.height * 0.50, // Y position (50% down from top)
      this.height * 0.18  // Height (18% of screen)
    );
    bg.addChild(playerZone);

    // Center battlefield line
    this.drawBattleLine(bg);

    return bg;
  }

  // Create a baord zone, either player or enemy territory
  // Rounded rectangle background
  // Border with team colour
  // Inner glow effect
  // Decorative Celtic pattern overlay
  private createBoardZone(type: 'player' | 'enemy', y: number, height: number): PIXI.Container {
    const zone = new PIXI.Container();
    zone.y = y;

    // Get zone width (65% of screen, centered)
    const boardWidth = this.width * 0.65;
    const marginLeft = (this.width - boardWidth) / 2;

    // Main zone background
    const bg = new PIXI.Graphics();
    bg.roundRect(marginLeft, 0, boardWidth, height, 12);

    if (type === 'enemy') {
      // Enemy zone - dark theme
      bg.fill({ color: COLORS.UI.deckBg, alpha: 0.5 });
      bg.stroke({ width: 3, color: COLORS.UI.brown });

      // Inner glow
      bg.roundRect(marginLeft + 4, 4, boardWidth - 8, height - 8, 10);
      bg.stroke({ width: 2, color: COLORS.ELEMENTS.fire, alpha: 0.3 });
    } else {
      // Player zone - forest theme
      bg.fill({ color: COLORS.TEAMS.player, alpha: 0.5 });
      bg.stroke({ width: 3, color: COLORS.UI.forest });

      // Inner glow (green)
      bg.roundRect(marginLeft + 4, 4, boardWidth - 8, height - 8, 10);
      bg.stroke({ width: 2, color: COLORS.UI.forestGlow, alpha: 0.3 });
    }

    zone.addChild(bg);

    // Decorative pattern overlay
    const pattern = this.createZonePattern(boardWidth, height, type);
    pattern.x = marginLeft;
    pattern.alpha = 0.1;

    // PixiJS Masking: restrict zone pattern to the bounds of the board zones
    const mask = new PIXI.Graphics();
    mask.roundRect(marginLeft, 0, boardWidth, height, 12);
    mask.fill(0xffffff);

    zone.addChild(mask);
    zone.addChild(pattern);
    pattern.mask = mask;

    return zone;
  }

  private createZonePattern(width: number, height: number, type: 'player' | 'enemy'): PIXI.Graphics {
    const pattern = new PIXI.Graphics();

    // Celtic knot-inspired pattern
    const spacing = 36;
    // color is red for enemy, green for player
    const color = type === 'enemy' ? COLORS.UI.red : COLORS.UI.green;

    for (let x = 0; x < width - spacing + 20; x += spacing) {
      for (let y = 0; y < height - spacing; y += spacing) {
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
    bg.stroke({ width: 3, color: COLORS.UI.victory, alpha: 0.6 });

    // Decorative dots along the line
    for (let x = marginLeft + 50; x < marginLeft + boardWidth; x += 50) {
      bg.circle(x, dividerY, 4);
      bg.fill({ color: COLORS.UI.victory, alpha: 0.8 });
    }
  }

  // Calculate positions for AI cards in hand
  // Layout:
  // Horizontal row at top of screen
  // Slightly off-centered on screen
  // Even spacing between cards
  getAIHandPositions(count: number): Position[] {
    if (count === 0) return [];

    // create a unique key for this count to add to the map
    const cacheKey = `ai-hand-${count}`;

    // Check if this has already been done
    if (this.positionCache.has(cacheKey)) {
      return this.positionCache.get(cacheKey)!;
    }

    // Calculations for positions in the AI's hand:
    const y = this.height * 0.0001;
    const spacing = 45;
    const centerX = this.width / 3;
    const totalWidth = (count - 1) * spacing;
    const startX = centerX - totalWidth / 2;
    const positions = Array.from({ length: count }, (_, i) => ({
      x: startX + i * spacing,
      y,
    }));

    this.positionCache.set(cacheKey, positions);
    return positions;
  }

  // Get positions for all minions on the AI's side of the field
  getAIBoardPositions(count: number): Position[] {
    if (count === 0) return [];

    // create a unique key for this count and add it to the map
    const cacheKey = `ai-board-${count}`;

    // return if this has already been done
    if (this.positionCache.has(cacheKey)) {
      return this.positionCache.get(cacheKey)!;
    }

    // y = height 
    const y = this.height * 0.22;
    const spacing = 130;
    const centerX = this.width / 2;
    const totalWidth = (count - 1) * spacing;
    const startX = centerX - totalWidth / 2;
    const positions = Array.from({ length: count }, (_, i) => ({
      x: startX + i * spacing,
      y,
    }));

    this.positionCache.set(cacheKey, positions);
    return positions;
  }

  // get the positions of minions on the player's side of the field
  getPlayerBoardPositions(count: number): Position[] {
    if (count === 0) return [];

    const cacheKey = `player-board-${count}`;

    if (this.positionCache.has(cacheKey)) {
      return this.positionCache.get(cacheKey)!;
    }

    const y = this.height * 0.515;
    const spacing = 130;
    const centerX = this.width / 2;
    const totalWidth = (count - 1) * spacing;
    const startX = centerX - totalWidth / 2;
    const positions = Array.from({ length: count }, (_, i) => ({
      x: startX + i * spacing,
      y,
    }));

    this.positionCache.set(cacheKey, positions);
    return positions;
  }

  // Get player hand positions
  getPlayerHandPositions(count: number): Position[] {
    if (count === 0) return [];

    const cacheKey = `player-hand-${count}`;

    if (this.positionCache.has(cacheKey)) {
      return this.positionCache.get(cacheKey)!;
    }

    const baseY = this.height * 0.85;
    const centerX = this.width / 2.125;
    const spacing = count <= 7 ? 115 : Math.min(115, (this.width * 0.6) / count);
    const totalWidth = (count - 1) * spacing;
    const startX = centerX - totalWidth / 2;

    const positions = Array.from({ length: count }, (_, i) => {
      const progress = count > 1 ? i / (count - 1) : 0.5;
      const xPos = startX + i * spacing;
      const curveAmount = 25;
      const yOffset = curveAmount * Math.pow(2 * progress - 1, 2) - curveAmount;
      return { x: xPos, y: baseY + yOffset };
    });

    this.positionCache.set(cacheKey, positions);
    return positions;
  }

  getAIPortraitPosition(): Position {
    return { x: this.width / 2 - 75, y: this.height * 0.06 };
  }

  getPlayerPortraitPosition(): Position {
    return { x: this.width / 2 - 75, y: this.height * 0.685 };
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
    return { x: this.width * 0.02, y: this.height * 0.25 };
  }

  getAIHealthPosition(): Position {
    return this.getAIPortraitPosition();
  }

  getPlayerHealthPosition(): Position {
    return this.getPlayerPortraitPosition();
  }
}