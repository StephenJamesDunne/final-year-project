import * as PIXI from 'pixi.js';
import { COLORS } from '../utils/StyleConstants'

export class EndTurnButton {
  private readonly RADIUS = 60;

  createButton(enabled: boolean, onClick: () => void): PIXI.Container {
    const button = new PIXI.Container();

    const bg = this.createBackground(enabled);
    button.addChild(bg);

    const text = this.createText(enabled);
    button.addChild(text);

    if (enabled) {
      this.reactToPlayer(button, bg, onClick);
    }

    return button;
  }

  private createBackground(enabled: boolean): PIXI.Graphics {
    const bg = new PIXI.Graphics();
    bg.circle(this.RADIUS, this.RADIUS, this.RADIUS);

    if (enabled) {
      bg.fill({ color: COLORS.UI.green, alpha: 0.9 });
      bg.stroke({ width: 4, color: COLORS.UI.gold });
    } else {
      bg.fill({ color: COLORS.UI.gray, alpha: 0.5 });
      bg.stroke({ width: 4, color: COLORS.UI.grayStroke });
    }

    return bg;
  }

  private createText(enabled: boolean): PIXI.Text {
    const text = new PIXI.Text({
      text: 'END\nTURN',
      style: {
        fontSize: 16,
        fontWeight: 'bold',
        fill: enabled ? COLORS.UI.white : COLORS.UI.gray,
        align: 'center',
        lineHeight: 20,
      },
    });
    text.x = this.RADIUS;
    text.y = this.RADIUS;
    text.anchor.set(0.5);
    return text;
  }

  private reactToPlayer(
    button: PIXI.Container,
    bg: PIXI.Graphics,
    onClick: () => void
  ): void {
    button.eventMode = 'static';
    button.cursor = 'pointer';

    button.on('pointerdown', onClick);

    button.on('pointerover', () => {
      bg.clear();
      bg.circle(this.RADIUS, this.RADIUS, this.RADIUS);
      bg.fill({ color: COLORS.UI.greenHover, alpha: 1 });
      bg.stroke({ width: 5, color: COLORS.UI.lightGold });
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.circle(this.RADIUS, this.RADIUS, this.RADIUS);
      bg.fill({ color: COLORS.UI.green, alpha: 0.9 });
      bg.stroke({ width: 4, color: COLORS.UI.victory });
    });
  }
}