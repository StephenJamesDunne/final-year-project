import * as PIXI from "pixi.js";
import { COLORS } from "../utils/StyleConstants";

export class TurnIndicator {
  // Background border color also changes with turn value, so a ref to the background
  // graphics needs to be kept for updates during gameplay
  createIndicator(
    turnNumber: number,
    currentTurn: "player" | "ai",
  ): PIXI.Container & {
    updateTurn: (turnNumber: number, currentTurn: "player" | "ai") => void;
  } {
    const container = new PIXI.Container() as PIXI.Container & {
      updateTurn: (turnNumber: number, currentTurn: "player" | "ai") => void;
    };

    const bg = new PIXI.Graphics();
    this.drawBackground(bg, currentTurn);
    container.addChild(bg);

    const turnText = new PIXI.Text({
      text: `Turn ${turnNumber}`,
      style: {
        fontSize: 18,
        fontWeight: "bold",
        fill: COLORS.UI.victory,
      },
    });
    turnText.x = 90;
    turnText.y = 15;
    turnText.anchor.set(0.5, 0);
    container.addChild(turnText);

    const playerText = new PIXI.Text({
      text: currentTurn === "player" ? "Your Turn" : "Enemy Turn",
      style: {
        fontSize: 14,
        fill: currentTurn === "player" ? COLORS.UI.blue : COLORS.UI.red,
      },
    });
    playerText.x = 90;
    playerText.y = 38;
    playerText.anchor.set(0.5, 0);
    container.addChild(playerText);

    container.updateTurn = (
      newTurnNumber: number,
      newCurrentTurn: "player" | "ai",
    ) => {
      bg.clear();
      this.drawBackground(bg, newCurrentTurn);
      turnText.text = `Turn ${newTurnNumber}`;
      playerText.text =
        newCurrentTurn === "player" ? "Your Turn" : "Enemy Turn";
      playerText.style.fill =
        newCurrentTurn === "player" ? COLORS.UI.blue : COLORS.UI.red;
    };

    return container;
  }

  private drawBackground(
    bg: PIXI.Graphics,
    currentTurn: "player" | "ai",
  ): void {
    bg.roundRect(0, 0, 180, 60, 8);
    bg.fill({ color: COLORS.UI.darkBg, alpha: 0.9 });
    bg.stroke({
      width: 2,
      color: currentTurn === "player" ? COLORS.UI.blue : COLORS.UI.red,
    });
  }
}
