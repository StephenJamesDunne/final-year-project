import * as PIXI from 'pixi.js';
import { COLORS } from '../utils/StyleConstants';
import { CardRenderer } from '../rendering/CardRenderer';
import { GraphicsHelpers } from '../utils/GraphicsHelpers';

export class DeckIndicator {
  private cardRenderer: CardRenderer;

  constructor(cardRenderer: CardRenderer) {
    this.cardRenderer = cardRenderer;
  }

  createIndicator(cardCount: number, isAI: boolean): PIXI.Container {
    const container = new PIXI.Container();

    // Card back visual — reuses the same design as AI hand cards
    const cardBack = this.cardRenderer.createCardBack();
    container.addChild(cardBack);

    // Count badge overlaid on top right corner of the card back
    const badge = GraphicsHelpers.createCircleBadge(
      cardCount,
      isAI ? COLORS.UI.red : COLORS.UI.blue,
      16,
    );
    badge.x = 82;
    badge.y = -8;
    container.addChild(badge);

    return container;
  }
}