import * as PIXI from 'pixi.js';
import { GraphicsHelpers } from '../utils/GraphicsHelpers';
import { COLORS } from '../utils/StyleConstants';

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
    const healthGem = GraphicsHelpers.createCircleBadge(health, COLORS.UI.red, 20);
    healthGem.x = this.PORTRAIT_SIZE / 2 - 30;
    healthGem.y = this.PORTRAIT_SIZE - 20;
    container.addChild(healthGem);

    // Mana gem
    const manaText = `${mana}/${maxMana}`;
    const manaGem = GraphicsHelpers.createCircleBadge(manaText, COLORS.UI.blue, 20);
    manaGem.x = this.PORTRAIT_SIZE / 2 + 10;
    manaGem.y = this.PORTRAIT_SIZE - 20;
    container.addChild(manaGem);

    return container;
  }

  private createFrame(isAI: boolean): PIXI.Graphics {
    const frame = new PIXI.Graphics();
    frame.circle(this.PORTRAIT_SIZE / 2, this.PORTRAIT_SIZE / 2, this.PORTRAIT_SIZE / 2);
    frame.fill({ color: isAI ? COLORS.UI.red : COLORS.UI.blue, alpha: 0.3 });
    frame.stroke({ width: 4, color: COLORS.UI.gold });
    return frame;
  }

  private createNameText(isAI: boolean): PIXI.Text {
    const text = new PIXI.Text({
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        fill: isAI ? COLORS.UI.red : COLORS.UI.blue,
        align: 'center',
      },
    });
    text.x = this.PORTRAIT_SIZE / 2;
    text.y = 12;
    text.anchor.set(0.5, 0);
    return text;
  }
}