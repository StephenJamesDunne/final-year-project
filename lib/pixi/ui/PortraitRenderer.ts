import * as PIXI from "pixi.js";
import { GraphicsHelpers } from "../utils/GraphicsHelpers";
import { COLORS } from "../utils/StyleConstants";

export class PortraitRenderer {
  private readonly PORTRAIT_SIZE = 120;

  // Creates the portrait once and returns it with update methods attached
  // Frame and name text are static, so only health and mana badge texts need updating
  createHeroPortrait(
    health: number,
    mana: number,
    maxMana: number,
    isAI: boolean,
  ): PIXI.Container & {
    updateHealth: (newHealth: number) => void;
    updateMana: (newMana: number, maxMana: number) => void;
  } {
    const container = new PIXI.Container() as PIXI.Container & {
      updateHealth: (newHealth: number) => void;
      updateMana: (newMana: number, maxMana: number) => void;
    };

    // Static elements created once and never changed
    container.addChild(this.createFrame(isAI));
    container.addChild(this.createNameText(isAI));

    // Health badge, keep reference to the text node for in-place updates
    const healthBadge = GraphicsHelpers.createCircleBadge(
      health,
      COLORS.UI.red,
      20,
    );
    healthBadge.x = this.PORTRAIT_SIZE / 2 - 35;
    healthBadge.y = this.PORTRAIT_SIZE - 20;
    container.addChild(healthBadge);

    // Mana badge, same as health badge but on the opposite side
    const manaBadge = GraphicsHelpers.createCircleBadge(
      `${mana}/${maxMana}`,
      COLORS.UI.blue,
      20,
    );
    manaBadge.x = this.PORTRAIT_SIZE / 2 + 5;
    manaBadge.y = this.PORTRAIT_SIZE - 20;
    container.addChild(manaBadge);

    // Update methods that reach into the badge text nodes
    // to update them without needing to recreate the whole portrait
    container.updateHealth = (newHealth: number) => {
      const text = healthBadge.getChildAt(1) as PIXI.Text;
      text.text = newHealth.toString();
    };

    container.updateMana = (newMana: number, newMaxMana: number) => {
      const text = manaBadge.getChildAt(1) as PIXI.Text;
      text.text = `${newMana}/${newMaxMana}`;
    };

    return container;
  }

  private createFrame(isAI: boolean): PIXI.Graphics {
    const frame = new PIXI.Graphics();
    frame.circle(
      this.PORTRAIT_SIZE / 2,
      this.PORTRAIT_SIZE / 2,
      this.PORTRAIT_SIZE / 2,
    );
    frame.fill({ color: isAI ? COLORS.UI.red : COLORS.UI.blue, alpha: 0.3 });
    frame.stroke({ width: 4, color: COLORS.UI.gold });
    return frame;
  }

  private createNameText(isAI: boolean): PIXI.Text {
    const text = new PIXI.Text({
      text: isAI ? "Enemy" : "Player",
      style: {
        fontSize: 14,
        fontWeight: "bold",
        fill: COLORS.UI.white,
        stroke: { color: COLORS.UI.black, width: 3 },
        align: "center",
      },
    });
    text.x = this.PORTRAIT_SIZE / 2;
    text.y = this.PORTRAIT_SIZE / 2;
    text.anchor.set(0.5, 0.5);

    return text;
  }
}
