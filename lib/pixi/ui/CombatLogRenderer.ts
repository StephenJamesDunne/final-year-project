import * as PIXI from "pixi.js";
import { COLORS } from "../utils/StyleConstants";

export class CombatLogRenderer {
  private readonly WIDTH = 320;
  private readonly HEIGHT = 520;
  private readonly LINE_HEIGHT = 36;
  private readonly MAX_ENTRIES = 12;
  private readonly START_Y = 55;
  private readonly PADDING = 15;

  createCombatLog(
    combatLog: string[],
  ): PIXI.Container & { updateLog: (combatLog: string[]) => void } {
    const container = new PIXI.Container() as PIXI.Container & {
      updateLog: (combatLog: string[]) => void;
    };

    container.addChild(this.createBackground());
    container.addChild(this.createTitle());
    container.addChild(this.createDivider());

    // Separate container for log entries, so they can be cleared/redrawn
    // when the log updates without needing to recreate the whole background/title/divider
    const entriesContainer = new PIXI.Container();
    container.addChild(entriesContainer);

    // Render initial entries
    this.renderEntries(entriesContainer, combatLog);

    // Updates to the container should only replace the entries container contents,
    // not the whole log
    container.updateLog = (newLog: string[]) => {
      while (entriesContainer.children.length > 0) {
        const child = entriesContainer.children[0];
        entriesContainer.removeChild(child);
        child.destroy({ children: true });
      }
      this.renderEntries(entriesContainer, newLog);
    };

    return container;
  }

  private renderEntries(container: PIXI.Container, combatLog: string[]): void {
    const recentLogs = combatLog.slice(-this.MAX_ENTRIES).reverse();

    recentLogs.forEach((log, index) => {
      const logText = new PIXI.Text({
        text: log.startsWith("═") || log.startsWith("─") ? log : `• ${log}`,
        style: {
          fontSize: 14,
          fill:
            log.includes("VICTORY") || log.includes("DEFEAT")
              ? COLORS.UI.victory
              : COLORS.UI.logText,
          fontWeight:
            log.startsWith("═") || log.startsWith("─") ? "bold" : "normal",
          wordWrap: true,
          wordWrapWidth: this.WIDTH - this.PADDING * 2,
          lineHeight: 18,
        },
      });
      logText.x = this.PADDING;
      logText.y = this.START_Y + index * this.LINE_HEIGHT;
      container.addChild(logText);
    });
  }

  private createBackground(): PIXI.Graphics {
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, this.WIDTH, this.HEIGHT, 8);
    bg.fill({ color: COLORS.UI.darkBg, alpha: 0.85 });
    bg.stroke({ width: 2, color: COLORS.UI.grayStroke });
    return bg;
  }

  private createTitle(): PIXI.Text {
    const title = new PIXI.Text({
      text: "Combat Log",
      style: {
        fontSize: 22,
        fontWeight: "bold",
        fill: COLORS.UI.victory,
      },
    });
    title.x = this.WIDTH / 2;
    title.y = 12;
    title.anchor.set(0.5, 0);
    return title;
  }

  private createDivider(): PIXI.Graphics {
    const divider = new PIXI.Graphics();
    divider.moveTo(10, 45);
    divider.lineTo(this.WIDTH - 10, 45);
    divider.stroke({ width: 1, color: COLORS.UI.grayStroke });
    return divider;
  }
}
