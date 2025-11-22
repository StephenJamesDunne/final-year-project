import * as PIXI from 'pixi.js';
import { COLORS } from '../utils/StyleConstants';

export class TurnIndicator {
  createIndicator(turnNumber: number, currentTurn: 'player' | 'ai'): PIXI.Container {
    const container = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 180, 60, 8);
    bg.fill({ color: COLORS.UI.darkBg, alpha: 0.9 });
    bg.stroke({ width: 2, color: currentTurn === 'player' ? COLORS.UI.blue : COLORS.UI.red });
    container.addChild(bg);

    const turnText = new PIXI.Text({
      text: `Turn ${turnNumber}`,
      style: {
        fontSize: 18,
        fontWeight: 'bold',
        fill: COLORS.UI.victory,
      },
    });
    turnText.x = 90;
    turnText.y = 15;
    turnText.anchor.set(0.5, 0);
    container.addChild(turnText);

    const playerText = new PIXI.Text({
      text: currentTurn === 'player' ? 'Your Turn' : 'Enemy Turn',
      style: {
        fontSize: 14,
        fill: currentTurn === 'player' ? COLORS.UI.blue : COLORS.UI.red,
      },
    });
    playerText.x = 90;
    playerText.y = 38;
    playerText.anchor.set(0.5, 0);
    container.addChild(playerText);

    return container;
  }
}