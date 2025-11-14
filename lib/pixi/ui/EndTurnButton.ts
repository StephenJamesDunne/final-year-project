import * as PIXI from 'pixi.js';

export class EndTurnButton {
  private readonly RADIUS = 60;

  createButton(enabled: boolean, onClick: () => void): PIXI.Container {
    const button = new PIXI.Container();

    const bg = this.createBackground(enabled);
    button.addChild(bg);

    const text = this.createText(enabled);
    button.addChild(text);

    if (enabled) {
      this.setupInteractivity(button, bg, onClick);
    }

    return button;
  }

  private createBackground(enabled: boolean): PIXI.Graphics {
    const bg = new PIXI.Graphics();
    bg.circle(this.RADIUS, this.RADIUS, this.RADIUS);

    if (enabled) {
      bg.fill({ color: 0x10b981, alpha: 0.9 });
      bg.stroke({ width: 4, color: 0xfbbf24 });
    } else {
      bg.fill({ color: 0x64748b, alpha: 0.5 });
      bg.stroke({ width: 4, color: 0x475569 });
    }

    return bg;
  }

  private createText(enabled: boolean): PIXI.Text {
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
    text.x = this.RADIUS;
    text.y = this.RADIUS;
    text.anchor.set(0.5);
    return text;
  }

  private setupInteractivity(
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
      bg.fill({ color: 0x059669, alpha: 1 });
      bg.stroke({ width: 5, color: 0xfde047 });
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.circle(this.RADIUS, this.RADIUS, this.RADIUS);
      bg.fill({ color: 0x10b981, alpha: 0.9 });
      bg.stroke({ width: 4, color: 0xfbbf24 });
    });
  }
}