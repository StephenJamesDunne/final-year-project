import * as PIXI from 'pixi.js';
import { COLORS } from '../utils/StyleConstants';

export class CombatLogRenderer {
  private readonly WIDTH = 320;
  private readonly HEIGHT = 450;
  private readonly LINE_HEIGHT = 32;
  private readonly MAX_ENTRIES = 12;

  createCombatLog(combatLog: string[]): PIXI.Container {
    const container = new PIXI.Container();

    // Background
    const bg = this.createBackground();
    container.addChild(bg);

    // Title
    const title = this.createTitle();
    container.addChild(title);

    // Divider
    const divider = this.createDivider();
    container.addChild(divider);

    // Log entries
    const recentLogs = combatLog.slice(-this.MAX_ENTRIES).reverse();
    this.renderLogEntries(container, recentLogs);

    return container;
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
      text: 'Combat Log',
      style: {
        fontSize: 22,
        fontWeight: 'bold',
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

  private renderLogEntries(container: PIXI.Container, logs: string[]): void {
    const startY = 55;
    const padding = 15;

    logs.forEach((log, i) => {
      const logText = new PIXI.Text({
        text: log.startsWith('═') || log.startsWith('─') ? log : `• ${log}`,
        style: {
          fontSize: 14,
          fill: log.includes('VICTORY') || log.includes('DEFEAT') ? COLORS.UI.victory : COLORS.UI.logText,
          fontWeight: log.startsWith('═') || log.startsWith('─') ? 'bold' : 'normal',
          wordWrap: true,
          wordWrapWidth: this.WIDTH - padding * 2,
          lineHeight: 18,
        },
      });
      logText.x = padding;
      logText.y = startY + i * this.LINE_HEIGHT;
      container.addChild(logText);
    });
  }
}