import * as PIXI from "pixi.js";
import { COLORS } from "../utils/StyleConstants";

export class EndTurnButton {
  private readonly RADIUS = 60;

  createButton(
    enabled: boolean,
    onClick: () => void,
  ): PIXI.Container & {
    updateEnabled: (enabled: boolean, onClick: () => void) => void;
  } {
    const container = new PIXI.Container() as PIXI.Container & {
      updateEnabled: (enabled: boolean, onClick: () => void) => void;
    };

    const bg = new PIXI.Graphics();
    this.drawBackground(bg, enabled);
    container.addChild(bg);

    const text = new PIXI.Text({
      text: "END\nTURN",
      style: {
        fontSize: 16,
        fontWeight: "bold",
        fill: enabled ? COLORS.UI.white : COLORS.UI.gray,
        align: "center",
        lineHeight: 20,
      },
    });
    text.x = this.RADIUS;
    text.y = this.RADIUS;
    text.anchor.set(0.5);
    container.addChild(text);

    if (enabled) {
      this.attachInteraction(container, bg, onClick);
    }

    container.updateEnabled = (newEnabled: boolean, newOnClick: () => void) => {
      // Redraw the background for new state
      bg.clear();
      this.drawBackground(bg, newEnabled);

      // Update text color
      text.style.fill = newEnabled ? COLORS.UI.white : COLORS.UI.gray;

      // Remove all existing lsteners and re-attach if now enabled
      container.removeAllListeners();
      if (newEnabled) {
        this.attachInteraction(container, bg, newOnClick);
      } else {
        container.eventMode = "none";
        container.cursor = "default";
      }
    };

    return container;
  }

  private drawBackground(bg: PIXI.Graphics, enabled: boolean): void {
    bg.circle(this.RADIUS, this.RADIUS, this.RADIUS);
    if (enabled) {
      bg.fill({ color: COLORS.UI.green, alpha: 0.9 });
      bg.stroke({ width: 4, color: COLORS.UI.gold });
    } else {
      bg.fill({ color: COLORS.UI.gray, alpha: 0.5 });
      bg.stroke({ width: 4, color: COLORS.UI.grayStroke });
    }
  }

  private attachInteraction(
    container: PIXI.Container,
    bg: PIXI.Graphics,
    onClick: () => void,
  ): void {
    container.eventMode = "static";
    container.cursor = "pointer";
    container.on("pointerdown", onClick);

    container.on("pointerover", () => {
      bg.clear();
      bg.circle(this.RADIUS, this.RADIUS, this.RADIUS);
      bg.fill({ color: COLORS.UI.greenHover, alpha: 1 });
      bg.stroke({ width: 5, color: COLORS.UI.lightGold });
    });

    container.on("pointerout", () => {
      bg.clear();
      bg.circle(this.RADIUS, this.RADIUS, this.RADIUS);
      bg.fill({ color: COLORS.UI.green, alpha: 0.9 });
      bg.stroke({ width: 4, color: COLORS.UI.victory });
    });
  }
}
