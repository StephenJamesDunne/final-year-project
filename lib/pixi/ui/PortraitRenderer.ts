import * as PIXI from 'pixi.js';
import { GraphicsHelpers } from '../utils/GraphicsHelpers';

export class PortraitRenderer {
  private readonly PORTRAIT_SIZE = 120;

  createHeroPortrait(
    health: number,
    mana: number,
    maxMana: number,
    isAI: boolean
  ): PIXI.Container {
    const container = new PIXI.Container();

    // Portrait frame
    const frame = this.createFrame(isAI);
    container.addChild(frame);

    // Name text
    const nameText = this.createNameText(isAI);
    container.addChild(nameText);

    // Health gem
    const healthGem = GraphicsHelpers.createCircleBadge(health, 0xef4444, 20);
    healthGem.x = this.PORTRAIT_SIZE / 2 - 30;
    healthGem.y = this.PORTRAIT_SIZE - 20;
    container.addChild(healthGem);

    // Mana gem
    const manaText = `${mana}/${maxMana}`;
    const manaGem = GraphicsHelpers.createCircleBadge(manaText, 0x3b82f6, 20);
    manaGem.x = this.PORTRAIT_SIZE / 2 + 10;
    manaGem.y = this.PORTRAIT_SIZE - 20;
    container.addChild(manaGem);

    return container;
  }

  private createFrame(isAI: boolean): PIXI.Graphics {
    const frame = new PIXI.Graphics();
    frame.circle(this.PORTRAIT_SIZE / 2, this.PORTRAIT_SIZE / 2, this.PORTRAIT_SIZE / 2);
    frame.fill({ color: isAI ? 0xcc3333 : 0x3366cc, alpha: 0.3 });
    frame.stroke({ width: 4, color: 0xd4af37 });
    return frame;
  }

  private createNameText(isAI: boolean): PIXI.Text {
    const text = new PIXI.Text({
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        fill: isAI ? 0xef4444 : 0x3b82f6,
        align: 'center',
      },
    });
    text.x = this.PORTRAIT_SIZE / 2;
    text.y = 12;
    text.anchor.set(0.5, 0);
    return text;
  }
}