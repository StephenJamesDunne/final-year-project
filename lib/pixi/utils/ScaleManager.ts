import * as PIXI from 'pixi.js';

// Scale Manager
// Scales the entire game to fit any screen size while maintaining the aspect ratio.
// The game is always laid out in 1920x1080. ScaleManager sits between
// that layout and the actual screen size. 

export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;

export class ScaleManager {
  private rootContainer: PIXI.Container;
  private currentScale: number = 1;
  private currentOffsetX: number = 0;
  private currentOffsetY: number = 0;

  constructor(rootContainer: PIXI.Container) {
    this.rootContainer = rootContainer;
  }

  // Calculate the scale and offset, then apply the result to the root container
  // Called once on init and then on every window resize
  apply(screenWidth: number, screenHeight: number): void {
    const scaleX = screenWidth / DESIGN_WIDTH;
    const scaleY = screenHeight / DESIGN_HEIGHT;
    this.currentScale = Math.min(scaleX, scaleY);

    // Apply the scale to the root container
    this.rootContainer.scale.set(this.currentScale);

    this.currentOffsetX = (screenWidth - DESIGN_WIDTH * this.currentScale) / 2;
    this.currentOffsetY = (screenHeight - DESIGN_HEIGHT * this.currentScale) / 2;

    // Center the scaled content on screen
    this.rootContainer.x = this.currentOffsetX;
    this.rootContainer.y = this.currentOffsetY;
  }

  getTransform(): { scale: number; offsetX: number; offsetY: number } {
    return {
      scale: this.currentScale,
      offsetX: this.currentOffsetX,
      offsetY: this.currentOffsetY,
    };
  }
}