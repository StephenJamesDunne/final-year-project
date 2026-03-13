import * as PIXI from 'pixi.js';

// Scale Manager
// Scales the entire game to fit any screen size while maintaining the aspect ratio.
// The game is always laid out in 1920x1080. ScaleManager sits between
// that layout and the actual screen size. 

export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;

export class ScaleManager {
  private rootContainer: PIXI.Container;

  constructor(rootContainer: PIXI.Container) {
    this.rootContainer = rootContainer;
  }

  // Calculate the scale and offset, then apply the result to the root container
  // Called once on init and then on every window resize
  apply(screenWidth: number, screenHeight: number): void {
    const scaleX = screenWidth / DESIGN_WIDTH;
    const scaleY = screenHeight / DESIGN_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    // Apply the scale to the root container
    this.rootContainer.scale.set(scale);

    // Center the scaled content on screen
    this.rootContainer.x = (screenWidth - DESIGN_WIDTH * scale) / 2;
    this.rootContainer.y = (screenHeight - DESIGN_HEIGHT * scale) / 2;
  }
}