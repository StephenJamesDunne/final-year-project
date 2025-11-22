import * as PIXI from 'pixi.js';
import { COLORS } from '../utils/StyleConstants';

export class DeckIndicator {
  createIndicator(cardCount: number, isAI: boolean): PIXI.Container {
    const container = new PIXI.Container();

    // Deck icon
    const deckIcon = new PIXI.Graphics();
    deckIcon.roundRect(0, 0, 60, 80, 4);
    deckIcon.fill({ color: COLORS.UI.deckBg, alpha: 0.9 });
    deckIcon.stroke({ width: 2, color: COLORS.UI.gold });
    container.addChild(deckIcon);

    // Card count badge
    const badge = new PIXI.Graphics();
    badge.circle(50, 10, 18);
    badge.fill({ color: isAI ? COLORS.UI.red : COLORS.UI.blue, alpha: 0.95 });
    badge.stroke({ width: 2, color: COLORS.UI.victory });
    container.addChild(badge);

    const text = new PIXI.Text({
      text: cardCount.toString(),
      style: {
        fontSize: 16,
        fontWeight: 'bold',
        fill: COLORS.UI.white,
        stroke: { color: COLORS.UI.black, width: 2 },
      },
    });
    text.x = 50;
    text.y = 10;
    text.anchor.set(0.5);
    container.addChild(text);

    return container;
  }
}