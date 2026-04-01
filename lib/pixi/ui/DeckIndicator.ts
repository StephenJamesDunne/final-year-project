import * as PIXI from 'pixi.js';
import { COLORS } from '../utils/StyleConstants';
import { CardRenderer } from '../rendering/CardRenderer';
import { GraphicsHelpers } from '../utils/GraphicsHelpers';

export class DeckIndicator {
  private cardRenderer: CardRenderer;

  constructor(cardRenderer: CardRenderer) {
    this.cardRenderer = cardRenderer;
  }

  // Card back is static, only the count badge text changes
  createIndicator(
    cardCount: number,
    isAI: boolean,
  ): PIXI.Container & { updateCount: (value: number) => void } {
    const container = new PIXI.Container() as PIXI.Container & {
      updateCount: (value: number) => void;
    };

    // Static card back created once
    const cardBack = this.cardRenderer.createCardBack();
    container.addChild(cardBack);

    // Count badge, keep reference for updates during gameplay
    const badge = GraphicsHelpers.createCircleBadge(
      cardCount,
      isAI ? COLORS.UI.red : COLORS.UI.blue,
      16,
    );
    badge.x = 82;
    badge.y = -8;
    container.addChild(badge);

    // Update just the badge text node on count changes, not the whole card back
    container.updateCount = (value: number) => {
      const text = badge.getChildAt(1) as PIXI.Text;
      text.text = value.toString();
    };

    return container;
  }
}