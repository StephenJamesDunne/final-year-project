import * as PIXI from 'pixi.js';

export class DeckIndicator {
  createIndicator(cardCount: number, isAI: boolean): PIXI.Container {
    const container = new PIXI.Container();

    // Deck icon
    const deckIcon = new PIXI.Graphics();
    deckIcon.roundRect(0, 0, 60, 80, 4);
    deckIcon.fill({ color: 0x2d1810, alpha: 0.9 });
    deckIcon.stroke({ width: 2, color: 0xd4af37 });
    container.addChild(deckIcon);

    // Card count badge
    const badge = new PIXI.Graphics();
    badge.circle(50, 10, 18);
    badge.fill({ color: isAI ? 0xef4444 : 0x3b82f6, alpha: 0.95 });
    badge.stroke({ width: 2, color: 0xfbbf24 });
    container.addChild(badge);

    const text = new PIXI.Text({
      text: cardCount.toString(),
      style: {
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 2 },
      },
    });
    text.x = 50;
    text.y = 10;
    text.anchor.set(0.5);
    container.addChild(text);

    return container;
  }
}