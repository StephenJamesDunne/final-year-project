import * as PIXI from "pixi.js";
import { Card, Minion } from "@/lib/types/game";
import { TextureLoader } from "../utils/TextureLoader";
import { CARD_DIMENSIONS, COLORS, FONTS } from "../utils/StyleConstants";
import { GraphicsHelpers } from "../utils/GraphicsHelpers";

// Card layout constant - proportions match Hearthstone's card layout/anatomy
// Art fills the upper 60% of the card, name banner overlaps the bottom of the art
// Description sits below the name, stats badges overlap the bottom corners of the card
// Mana cost badge in top left, attack and health badges in bottom left and right respectively
const LAYOUT = {
  // Art area
  ART_X: 6,
  ART_Y: 12,
  ART_WIDTH_INSET: 12,      // artWidth = CARD_WIDTH - ART_WIDTH_INSET
  ART_HEIGHT: 82,           // roughly 60% of the card height

  // Name banner
  NAME_Y: 82,               // Overlaps bottom of art
  NAME_HEIGHT: 20,
  NAME_X_INSET: 4,          // horizontal padding from the edge of a card
  NAME_WIDTH_INSET: 8,      // CARD_WIDTH - 8

  // Description area
  DESC_Y: 106,
  DESC_HEIGHT: 24,
  DESC_FONT_SIZE: 7,
  DESC_LINE_HEIGHT: 9,

  // Badges
  BADGE_Y_OFFSET: 20,       // How far badges hang below card bottom
  BADGE_LEFT_X: -8,
  BADGE_RIGHT_X_INSET: 20,  // rightBadgeX = CARD_WIDTH - BADGE_RIGHT_X_INSET

  // Mana crystal
    MANA_X: -8,
    MANA_Y: -8,

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

  // Must be called once before any card creation to load shared assets
  async loadAssets(): Promise<void> {
    console.log("CardRenderer: Loading assets...");

    try {
      await this.textureLoader.loadTexture(
        "card-frame",
        "/images/default/card-frame.png",
      );
      await this.textureLoader.loadTexture(
        "card-back",
        "/images/default/card-back.png",
      );
      console.log("CardRenderer: Assets loaded successfully");
    } catch {
      console.warn("CardRenderer: Some assets failed to load, using fallbacks");
    }
  }

  // --- Card Creation ---------------------------------------------------

  // Full card for hand: shows art, name desctiption, mana cost, attack/health
  createCard(card: Card, showName: boolean = true): PIXI.Container {
    const container = new PIXI.Container();

    container.addChild(
      GraphicsHelpers.createShadow(
        this.CARD_WIDTH,
        this.CARD_HEIGHT,
        CARD_DIMENSIONS.BORDER_RADIUS,
      ),
    );
    container.addChild(this.createCardBackground(card));
    container.addChild(this.createArtArea(card));
    container.addChild(this.createCardFrame(card.element));

    if (showName) {
      const nameBanner = this.createNameBanner(card.name);
      nameBanner.y = LAYOUT.NAME_Y;
      container.addChild(nameBanner);
    }

    if (card.description) {
      const desc = this.createDescriptionArea(card.description);
      desc.y = LAYOUT.DESC_Y;
      container.addChild(desc);
    }

    const manaCost = this.createManaCrystal(card.manaCost);
    manaCost.x = LAYOUT.MANA_X;
    manaCost.y = LAYOUT.MANA_Y;
    container.addChild(manaCost);

    if (
      card.type === "minion" &&
      card.attack !== undefined &&
      card.health !== undefined
    ) {
      const attackBadge = this.createAttackBadge(card.attack);
      attackBadge.x = LAYOUT.BADGE_LEFT_X;
      attackBadge.y = this.CARD_HEIGHT - LAYOUT.BADGE_Y_OFFSET;
      container.addChild(attackBadge);

      const healthBadge = this.createHealthBadge(card.health);
      healthBadge.x = this.CARD_WIDTH - LAYOUT.BADGE_RIGHT_X_INSET;
      healthBadge.y = this.CARD_HEIGHT - LAYOUT.BADGE_Y_OFFSET;
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
    container.addChild(this.createCardBackground(minion));
    container.addChild(this.createArtArea(minion));
    container.addChild(this.createCardFrame(minion.element));

    const isDamaged = minion.currentHealth < minion.health;

    const attackBadge = this.createAttackBadge(minion.attack);
    attackBadge.x = LAYOUT.BADGE_LEFT_X;
    attackBadge.y = this.CARD_HEIGHT - LAYOUT.BADGE_Y_OFFSET;
    container.addChild(attackBadge);

    const healthBadge = this.createHealthBadge(minion.currentHealth, isDamaged);
    healthBadge.x = this.CARD_WIDTH - LAYOUT.BADGE_RIGHT_X_INSET;
    healthBadge.y = this.CARD_HEIGHT - LAYOUT.BADGE_Y_OFFSET;
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
  private createCardBackground(card: Card | Minion): PIXI.Graphics {
    const bg = new PIXI.Graphics();

    bg.roundRect(
      0,
      0,
      this.CARD_WIDTH,
      this.CARD_HEIGHT,
      CARD_DIMENSIONS.BORDER_RADIUS,
    );
    bg.fill({ color: COLORS.UI.darkBg, alpha: 1.0 });
    bg.stroke({ width: 3, color: this.getElementBorderColor(card.element) });

    return bg;
  }

  // Art area - loads image async if available, falls back to styled placeholder
  // Both hand cards and board minions use this same art area
  private createArtArea(card: Card | Minion): PIXI.Container {
    const artContainer = new PIXI.Container();

    artContainer.x = LAYOUT.ART_X;
    artContainer.y = LAYOUT.ART_Y;

    const artWidth = this.CARD_WIDTH - LAYOUT.ART_WIDTH_INSET;
    const artHeight = LAYOUT.ART_HEIGHT;

    // Placeholder shown until art is loaded in correctly
    const placeholder = new PIXI.Graphics();
    placeholder.roundRect(0, 0, artWidth, artHeight, 4);
    placeholder.fill({ color: COLORS.UI.placeholder, alpha: 1 });
    artContainer.addChild(placeholder);

    // Element colour tint on placeholder so cards are visually distinct without art
    const elementTint = new PIXI.Graphics();
    elementTint.roundRect(0, 0, artWidth, artHeight, 4);
    elementTint.fill({
      color: this.getElementColor(card.element),
      alpha: 0.15,
    });
    artContainer.addChild(elementTint);

    // Clip mask to keep art within the art area bounds
    const mask = new PIXI.Graphics();
    mask.roundRect(0, 0, artWidth, artHeight, 4);
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
  private createCardFrame(element: string): PIXI.Graphics {
    const frame = new PIXI.Graphics();

    frame.roundRect(
      0,
      0,
      this.CARD_WIDTH,
      this.CARD_HEIGHT,
      CARD_DIMENSIONS.BORDER_RADIUS,
    );
    frame.stroke({ width: 2, color: COLORS.UI.gold, alpha: LAYOUT.FRAME_OUTER_ALPHA });

    // Inner element glow
    frame.roundRect(LAYOUT.FRAME_INSET,
      LAYOUT.FRAME_INSET,
      this.CARD_WIDTH - LAYOUT.FRAME_INSET * 2,
      this.CARD_HEIGHT - LAYOUT.FRAME_INSET * 2,
      LAYOUT.FRAME_INNER_RADIUS,);
    frame.stroke({
      width: 1,
      color: this.getElementBorderColor(element),
      alpha: LAYOUT.FRAME_INNER_ALPHA,
    });

    return frame;
  }

  // Name banner - dark scroll across the middle of the card
  // that overlaps the art. Compact flag retained here for potential
  // use in the debug overlay implementation
  private createNameBanner(
    name: string,
    compact: boolean = false,
  ): PIXI.Container {
    const banner = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.roundRect(LAYOUT.NAME_X_INSET, 0, this.CARD_WIDTH - LAYOUT.NAME_WIDTH_INSET, LAYOUT.NAME_HEIGHT, 4);
    bg.fill({ color: COLORS.UI.darkBg, alpha: 0.92 });
    bg.stroke({ width: 1, color: COLORS.UI.gold, alpha: 0.8 });
    banner.addChild(bg);

    const text = new PIXI.Text({
      text: name,
      style: {
        fontSize: compact ? 8 : FONTS.CARD_NAME.fontSize,
        fontWeight: FONTS.CARD_NAME.fontWeight as "bold",
        fill: FONTS.CARD_NAME.fill,
        stroke: { color: COLORS.UI.black, width: 2 },
        align: "center",
        wordWrap: true,
        wordWrapWidth: this.CARD_WIDTH - LAYOUT.NAME_WIDTH_INSET * 2,
      },
    });

    text.x = this.CARD_WIDTH / 2;
    text.y = LAYOUT.NAME_HEIGHT / 2;
    text.anchor.set(0.5);
    banner.addChild(text);

    return banner;
  }

  private createDescriptionArea(description: string): PIXI.Container {
    const area = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.roundRect(LAYOUT.NAME_X_INSET, 0, this.CARD_WIDTH - LAYOUT.NAME_WIDTH_INSET, LAYOUT.DESC_HEIGHT, 4);
    bg.fill({ color: COLORS.UI.darkBg, alpha: 0.7 });
    area.addChild(bg);

    const text = new PIXI.Text({
      text: description,
      style: {
        fontSize: LAYOUT.DESC_FONT_SIZE,
        fill: COLORS.UI.logText,
        wordWrap: true,
        wordWrapWidth: this.CARD_WIDTH - LAYOUT.NAME_WIDTH_INSET * 2,
        lineHeight: LAYOUT.DESC_LINE_HEIGHT,
        align: "center",
      },
    });
    text.x = this.CARD_WIDTH / 2;
    text.y = LAYOUT.DESC_HEIGHT / 2;
    text.anchor.set(0.5);
    area.addChild(text);

    return area;
  }

  // --- Badge Elements ---------------------------------------------------

  private createManaCrystal(cost: number): PIXI.Container {
    return GraphicsHelpers.createHexagon(16, COLORS.UI.blue, cost);
  }

  private createAttackBadge(attack: number): PIXI.Container {
    return GraphicsHelpers.createCircleBadge(attack, COLORS.ELEMENTS.fire, 16);
  }

  private createHealthBadge(
    health: number,
    isDamaged: boolean = false,
  ): PIXI.Container {
    return GraphicsHelpers.createCircleBadge(
      health,
      isDamaged ? COLORS.ELEMENTS.fire : COLORS.ELEMENTS.earth,
      16,
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

  private getElementBorderColor(element: string): number {
    return (
      COLORS.BORDERS[element as keyof typeof COLORS.BORDERS] ||
      COLORS.BORDERS.neutral
    );
  }
}
