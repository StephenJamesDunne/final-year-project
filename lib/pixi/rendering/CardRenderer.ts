import * as PIXI from "pixi.js";
import { Card, Minion } from "@/lib/types/game";
import { TextureLoader } from "../utils/TextureLoader";
import { CARD_DIMENSIONS, COLORS, FONTS } from "../utils/StyleConstants";
import { GraphicsHelpers } from "../utils/GraphicsHelpers";

// Card layout constant - proportions match Hearthstone's card layout/anatomy
// Art fills the upper 60% of the card, name banner overlaps the bottom of the art
// Description sits below the name, stats badges overlap the bottom corners of the card
// Mana cost badge in top left, attack and health badges in bottom left and right respectively
export const CARD_LAYOUT = {
  // Art area
  ART_X: 4,
  ART_Y: 5,
  ART_WIDTH_INSET: 8, // artWidth = CARD_WIDTH - ART_WIDTH_INSET
  ART_HEIGHT: 90, // roughly 60% of the card height

  // Name banner
  NAME_Y: 82, // Overlaps bottom of art
  NAME_HEIGHT: 20,
  NAME_X_INSET: 4, // horizontal padding from the edge of a card
  NAME_WIDTH_INSET: 8, // CARD_WIDTH - 8

  // Description area
  DESC_Y: 103,
  DESC_HEIGHT: 36,
  DESC_FONT_SIZE: 8,
  DESC_LINE_HEIGHT: 12,

  // Decorative frame elements
  FRAME_OUTER_ALPHA: 0.6,
  FRAME_INSET: 4,
  FRAME_INNER_RADIUS: 6,
  FRAME_INNER_ALPHA: 0.4,
} as const;

export class CardRenderer {
  private textureLoader = TextureLoader.getInstance();
  private readonly CARD_WIDTH = CARD_DIMENSIONS.WIDTH;
  private readonly CARD_HEIGHT = CARD_DIMENSIONS.HEIGHT;

  // --- Card Creation ---------------------------------------------------

  // Full card for hand: shows art, name desctiption, mana cost, attack/health
  createCard(
    card: Card,
    showName: boolean = true,
    badgeScale: number = 1,
    cardScale: number = 1,
  ): PIXI.Container {
    const container = new PIXI.Container();
    const W = this.CARD_WIDTH * cardScale;
    const H = this.CARD_HEIGHT * cardScale;
    const R = CARD_DIMENSIONS.BORDER_RADIUS * cardScale;

    container.addChild(GraphicsHelpers.createShadow(W, H, R));
    container.addChild(this.createCardBackground(W, H, R));
    container.addChild(this.createArtArea(card, W, cardScale));
    container.addChild(this.createCardFrame(W, H, R));

    if (showName) {
      const nameBanner = this.createNameBanner(card.name, false, W, cardScale);
      nameBanner.y = CARD_LAYOUT.NAME_Y * cardScale;
      container.addChild(nameBanner);
    }

    if (card.description) {
      const desc = this.createDescriptionArea(card.description, W, cardScale);
      desc.y = CARD_LAYOUT.DESC_Y * cardScale;
      container.addChild(desc);
    }

    const manaSize = 16 * badgeScale;
    const manaCost = this.createManaCrystal(card.manaCost, badgeScale);
    manaCost.x = -manaSize;
    manaCost.y = -manaSize;
    container.addChild(manaCost);

    if (
      card.type === "minion" &&
      card.attack !== undefined &&
      card.health !== undefined
    ) {
      const badgeRadius = 16 * badgeScale;

      const attackBadge = this.createAttackBadge(card.attack, badgeScale);
      attackBadge.x = -badgeRadius;
      attackBadge.y = H - badgeRadius;
      container.addChild(attackBadge);

      const healthBadge = this.createHealthBadge(
        card.health,
        false,
        badgeScale,
      );
      healthBadge.x = W - badgeRadius;
      healthBadge.y = H - badgeRadius;
      container.addChild(healthBadge);
    }

    return container;
  }

  // Board minion, same card structure but no description, art fills more space
  // Nmae is omitted since the hover tooltip will provide that detail
  createMinionCard(minion: Minion): PIXI.Container {
    const container = new PIXI.Container();

    if (this.hasTauntAbility(minion)) {
      const tauntIndicator = this.createTauntIndicator();
      container.addChild(tauntIndicator);
    }

    container.addChild(
      GraphicsHelpers.createShadow(
        this.CARD_WIDTH,
        this.CARD_HEIGHT,
        CARD_DIMENSIONS.BORDER_RADIUS,
      ),
    );
    container.addChild(this.createCardBackground());
    container.addChild(this.createArtArea(minion, this.CARD_WIDTH, 1, true));
    container.addChild(this.createCardFrame());

    const isDamaged = minion.currentHealth < minion.health;

    const badgeRadius = 16;

    const attackBadge = this.createAttackBadge(minion.attack);
    attackBadge.x = -badgeRadius;
    attackBadge.y = this.CARD_HEIGHT - badgeRadius;
    container.addChild(attackBadge);

    const healthBadge = this.createHealthBadge(minion.currentHealth, isDamaged);
    healthBadge.x = this.CARD_WIDTH - badgeRadius;
    healthBadge.y = this.CARD_HEIGHT - badgeRadius;
    container.addChild(healthBadge);

    return container;
  }

  createCardBack(): PIXI.Container {
    const container = new PIXI.Container();

    container.addChild(
      GraphicsHelpers.createShadow(
        this.CARD_WIDTH,
        this.CARD_HEIGHT,
        CARD_DIMENSIONS.BORDER_RADIUS,
      ),
    );

    const bg = new PIXI.Graphics();
    bg.roundRect(
      0,
      0,
      this.CARD_WIDTH,
      this.CARD_HEIGHT,
      CARD_DIMENSIONS.BORDER_RADIUS,
    );
    bg.fill({ color: COLORS.UI.deckBg, alpha: 0.95 });
    bg.stroke({ width: 3, color: COLORS.UI.brown });
    container.addChild(bg);

    const cardBackKey = "card-back";
    if (this.textureLoader.hasTexture(cardBackKey)) {
      const sprite = new PIXI.Sprite(
        this.textureLoader.getTexture(cardBackKey),
      );
      sprite.width = this.CARD_WIDTH - 10;
      sprite.height = this.CARD_HEIGHT - 10;
      sprite.x = 5;
      sprite.y = 5;
      container.addChild(sprite);
    } else {
      const pattern = this.createCelticPattern();
      pattern.x = this.CARD_WIDTH / 2;
      pattern.y = this.CARD_HEIGHT / 2;
      container.addChild(pattern);
    }

    return container;
  }

  // Taunt shield overlay - thick stone border around the card
  createTauntIndicator(): PIXI.Graphics {
    const shield = new PIXI.Graphics();

    // Shield shape around the card
    shield.roundRect(-4, -4, this.CARD_WIDTH + 8, this.CARD_HEIGHT + 8, 10);
    shield.stroke({
      width: 4,
      color: COLORS.UI.gray,
      alpha: 0.9,
    });

    // Inner glow
    shield.roundRect(-2, -2, this.CARD_WIDTH + 4, this.CARD_HEIGHT + 4, 9);
    shield.stroke({
      width: 2,
      color: COLORS.UI.white,
      alpha: 0.4,
    });

    return shield;
  }

  createAttackGlow(): PIXI.Graphics {
    const glow = new PIXI.Graphics();
    glow.roundRect(-5, -5, this.CARD_WIDTH + 10, this.CARD_HEIGHT + 10, 10);
    glow.fill({ color: COLORS.UI.forestGlow, alpha: 0.3 });
    return glow;
  }

  createTargetGlow(): PIXI.Graphics {
    const glow = new PIXI.Graphics();
    glow.roundRect(-5, -5, this.CARD_WIDTH + 10, this.CARD_HEIGHT + 10, 10);
    glow.fill({ color: COLORS.UI.red, alpha: 0.3 });
    return glow;
  }

  // --- Structural Components ---------------------------------------------------

  // Dark background with element-colored border
  private createCardBackground(
    W: number = this.CARD_WIDTH,
    H: number = this.CARD_HEIGHT,
    R: number = CARD_DIMENSIONS.BORDER_RADIUS,
  ): PIXI.Graphics {
    const bg = new PIXI.Graphics();

    bg.roundRect(0, 0, W, H, R);
    bg.fill({ color: COLORS.UI.cardBg, alpha: 1.0 });
    bg.stroke({ width: 3, color: COLORS.UI.gold });

    return bg;
  }

  // Art area - loads image async if available, falls back to styled placeholder
  // Both hand cards and board minions use this same art area
  private createArtArea(
    card: Card | Minion,
    W: number = this.CARD_WIDTH,
    cardScale: number = 1,
    fullHeight: boolean = false,
  ): PIXI.Container {
    const artContainer = new PIXI.Container();

    artContainer.x = CARD_LAYOUT.ART_X * cardScale;
    artContainer.y = CARD_LAYOUT.ART_Y * cardScale;

    const artWidth = W - CARD_LAYOUT.ART_WIDTH_INSET * cardScale;
    // Full height fills to card bottom minus the ART_Y offset and badge overlap
    const artHeight = fullHeight
        ? (this.CARD_HEIGHT - CARD_LAYOUT.ART_Y - 4) * cardScale
        : CARD_LAYOUT.ART_HEIGHT * cardScale;

    // Placeholder shown until art is loaded in correctly
    const placeholder = new PIXI.Graphics();
    placeholder.roundRect(0, 0, artWidth, artHeight, 4 * cardScale);
    placeholder.fill({ color: COLORS.UI.placeholder, alpha: 1 });
    artContainer.addChild(placeholder);

    // Element colour tint on placeholder so cards are visually distinct without art
    const elementTint = new PIXI.Graphics();
    elementTint.roundRect(0, 0, artWidth, artHeight, 4 * cardScale);
    elementTint.fill({
      color: this.getElementColor(card.element),
      alpha: 0.15,
    });
    artContainer.addChild(elementTint);

    // Clip mask to keep art within the art area bounds
    const mask = new PIXI.Graphics();
    mask.roundRect(0, 0, artWidth, artHeight, 4 * cardScale);
    mask.fill(COLORS.UI.cardFill);
    artContainer.addChild(mask);

    // Async art load, replaces the placeholder when loaded successfully
    if (card.imageUrl) {
      this.textureLoader
        .loadTexture(card.imageUrl, card.imageUrl)
        .then((texture) => {
          const sprite = new PIXI.Sprite(texture);
          sprite.width = artWidth;
          sprite.height = artHeight;
          artContainer.addChild(sprite);
          sprite.mask = mask;
          artContainer.addChildAt(sprite, 1);
        })
        .catch(() => {
          // Placeholder stays visible if art fails to load
        });
    }
    return artContainer;
  }

  // Decorative frame overlay - element-coloured inner glow
  private createCardFrame(W: number = this.CARD_WIDTH, H: number = this.CARD_HEIGHT, R: number = CARD_DIMENSIONS.BORDER_RADIUS): PIXI.Graphics {
    const frame = new PIXI.Graphics();

    frame.roundRect(0, 0, W, H, R);
    frame.stroke({
      width: 2,
      color: COLORS.UI.gold,
      alpha: CARD_LAYOUT.FRAME_OUTER_ALPHA,
    });

    // Inner element glow
    frame.roundRect(
      CARD_LAYOUT.FRAME_INSET,
      CARD_LAYOUT.FRAME_INSET,
      W - CARD_LAYOUT.FRAME_INSET * 2,
      H - CARD_LAYOUT.FRAME_INSET * 2,
      CARD_LAYOUT.FRAME_INNER_RADIUS,
    );
    frame.stroke({
      width: 1,
      color: COLORS.UI.gold,
      alpha: CARD_LAYOUT.FRAME_INNER_ALPHA,
    });

    return frame;
  }

  // Name banner - dark scroll across the middle of the card
  // that overlaps the art. Compact flag retained here for potential
  // use in the debug overlay implementation
  private createNameBanner(
    name: string,
    compact: boolean = false,
    W: number = this.CARD_WIDTH,
    cardScale: number = 1,
  ): PIXI.Container {
    const banner = new PIXI.Container();
    const HEIGHT = CARD_LAYOUT.NAME_HEIGHT * cardScale;

    const bg = new PIXI.Graphics();
    bg.roundRect(
      CARD_LAYOUT.NAME_X_INSET * cardScale,
      0,
      W - CARD_LAYOUT.NAME_WIDTH_INSET * cardScale,
      HEIGHT,
      4 * cardScale,
    );
    bg.fill({ color: COLORS.UI.innercardBg, alpha: 0.92 });
    bg.stroke({ width: 1, color: COLORS.UI.gold, alpha: 0.8 });
    banner.addChild(bg);

    const text = new PIXI.Text({
      text: name,
      style: {
        fontSize: (compact ? 8 : FONTS.CARD_NAME.fontSize) * cardScale,
        fontWeight: FONTS.CARD_NAME.fontWeight as "bold",
        fill: FONTS.CARD_NAME.fill,
        stroke: { color: COLORS.UI.black, width: 2 },
        align: "center",
        wordWrap: true,
        wordWrapWidth: W - CARD_LAYOUT.NAME_WIDTH_INSET * cardScale * 2,
      },
    });

    text.x = W / 2;
    text.y = HEIGHT / 2;
    text.anchor.set(0.5);
    banner.addChild(text);

    return banner;
  }

  private createDescriptionArea(
    description: string,
    W: number = this.CARD_WIDTH,
    cardScale: number = 1,
  ): PIXI.Container {
    const area = new PIXI.Container();
    const HEIGHT = CARD_LAYOUT.DESC_HEIGHT * cardScale;

    const bg = new PIXI.Graphics();
    bg.roundRect(
      CARD_LAYOUT.NAME_X_INSET * cardScale,
      0,
      W - CARD_LAYOUT.NAME_WIDTH_INSET * cardScale,
      HEIGHT,
      4 * cardScale,
    );
    bg.fill({ color: COLORS.UI.innercardBg, alpha: 0.7 });
    area.addChild(bg);

    const text = new PIXI.Text({
      text: description,
      style: {
        fontSize: CARD_LAYOUT.DESC_FONT_SIZE * cardScale,
        fill: FONTS.CARD_NAME.fill,
        stroke: { color: COLORS.UI.black, width: 1.5 },
        align: "center",
        wordWrap: true,
        wordWrapWidth: (W - CARD_LAYOUT.NAME_WIDTH_INSET * cardScale * 2),
        lineHeight: CARD_LAYOUT.DESC_LINE_HEIGHT * cardScale,
      },
    });
    text.x = W / 2;
    text.y = HEIGHT / 2;
    text.anchor.set(0.5);

    // Mask to keep description text within the description area bounds
    const mask = new PIXI.Graphics();
    mask.roundRect(
      CARD_LAYOUT.NAME_X_INSET * cardScale,
      0,
      W - CARD_LAYOUT.NAME_WIDTH_INSET * cardScale,
      HEIGHT,
      4 * cardScale,
    );
    mask.fill(0xffffff);
    area.addChild(mask);
    area.addChild(text);
    text.mask = mask;

    return area;
  }

  // --- Badge Elements ---------------------------------------------------

  private createManaCrystal(cost: number, scale: number = 1): PIXI.Container {
    return GraphicsHelpers.createHexagon(16 * scale, COLORS.UI.blue, cost);
  }

  private createAttackBadge(attack: number, scale: number = 1): PIXI.Container {
    return GraphicsHelpers.createCircleBadge(
      attack,
      COLORS.ELEMENTS.fire,
      16 * scale,
    );
  }

  private createHealthBadge(
    health: number,
    isDamaged: boolean = false,
    scale: number = 1,
  ): PIXI.Container {
    return GraphicsHelpers.createCircleBadge(
      health,
      isDamaged ? COLORS.ELEMENTS.fire : COLORS.ELEMENTS.earth,
      16 * scale,
    );
  }

  // --- Decorative Elements ---------------------------------------------------
  private createCelticPattern(): PIXI.Graphics {
    const pattern = new PIXI.Graphics();

    pattern.circle(0, 0, 30);
    pattern.stroke({ width: 3, color: COLORS.UI.brown });

    pattern.circle(0, 0, 20);
    pattern.stroke({ width: 2, color: COLORS.UI.gold });

    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const x = 15 * Math.cos(angle);
      const y = 15 * Math.sin(angle);
      pattern.circle(x, y, 8);
      pattern.fill({ color: COLORS.UI.deckBg, alpha: 0.8 });
      pattern.stroke({ width: 2, color: COLORS.UI.gold });
    }

    return pattern;
  }

  // --- Utility functions ---------------------------------------------------
  private hasTauntAbility(minion: Minion): boolean {
    return (
      minion.abilities?.some(
        (ability) =>
          ability.trigger === "passive" &&
          ability.description?.toLowerCase().includes("taunt"),
      ) ?? false
    );
  }

  private getElementColor(element: string): number {
    return (
      COLORS.ELEMENTS[element as keyof typeof COLORS.ELEMENTS] ||
      COLORS.ELEMENTS.neutral
    );
  }
}
