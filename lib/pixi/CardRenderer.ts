import * as PIXI from 'pixi.js';
import { Card as CardType, Minion, Element } from '@/lib/types/game';

const CARD_WIDTH = 120;
const CARD_HEIGHT = 160;

const ELEMENT_COLORS: Record<Element, number> = {
  fire: 0xdc2626,
  water: 0x2563eb,
  earth: 0x16a34a,
  air: 0x9333ea,
  spirit: 0x4f46e5,
  neutral: 0x6b7280,
};

/**
 * Handles rendering of individual cards and card components
 */
export class CardRenderer {
  private textures: Map<string, PIXI.Texture> = new Map();
  private assetsLoaded = false;

  /**
   * Load card artwork assets
   */
  async loadAssets(): Promise<void> {
    if (this.assetsLoaded) return;

    const cardArtPaths: Record<string, string> = {
      'balor-of-the-evil-eye': 'balor',
      'queen-maedhbh': 'queenmaedhbh',
      'salmon-of-knowledge': 'salmonofknowledge',
      'lugh-lamhfhada': 'lughlamhfhada',
      'puca-trickster': 'pucatrickster',
      'the-dagda': 'dagda',
      'dullahan': 'dullahan',
      'fionn-mac-cumhaill': 'fionnmaccumhaill',
      'manannan-mac-lir': 'manannan',
      'scathach': 'scathach',
    };

    for (const [cardName, assetName] of Object.entries(cardArtPaths)) {
      try {
        const texture = await PIXI.Assets.load(`/images/cards/${assetName}.png`);
        this.textures.set(cardName, texture);
      } catch (error) {
        console.warn(`Failed to load card art: ${cardName}`);
      }
    }

    this.assetsLoaded = true;
  }

  /**
   * Create a full card sprite
   */
  createCard(card: CardType): PIXI.Container {
    const container = new PIXI.Container();

    // Card frame
    this.addCardFrame(container, card.element);

    // Card art
    this.addCardArt(container, card);

    // Card name
    this.addCardName(container, card.name);

    // Mana cost
    this.addManaCost(container, card.manaCost);

    // Stats (if minion)
    if (card.type === 'minion' && card.attack !== undefined && card.health !== undefined) {
      this.addMinionStats(container, card.attack, card.health);
    }

    return container;
  }

  /**
   * Create a minion card (on board)
   */
  createMinionCard(minion: Minion, showHealth: boolean = true): PIXI.Container {
    const container = new PIXI.Container();

    // Card frame
    this.addCardFrame(container, minion.element);

    // Card art
    this.addCardArt(container, minion);

    // Card name
    this.addCardName(container, minion.name);

    // Stats
    this.addMinionStats(
      container,
      minion.attack,
      showHealth ? minion.currentHealth : minion.health,
      minion.currentHealth < minion.health
    );

    return container;
  }

  /**
   * Create a card back (for AI hand)
   */
  createCardBack(): PIXI.Container {
    const container = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 80, 100, 8);
    bg.fill({ color: 0x8b0000 });
    bg.stroke({ width: 2, color: 0xdc2626 });

    container.addChild(bg);
    return container;
  }

  /**
   * Create attack glow effect
   */
  createAttackGlow(): PIXI.Graphics {
    const glow = new PIXI.Graphics();
    glow.roundRect(-5, -5, CARD_WIDTH + 10, CARD_HEIGHT + 10, 12);
    glow.stroke({ width: 3, color: 0x10b981, alpha: 0.8 });
    return glow;
  }

  /**
   * Create target glow effect
   */
  createTargetGlow(): PIXI.Graphics {
    const glow = new PIXI.Graphics();
    glow.roundRect(-5, -5, CARD_WIDTH + 10, CARD_HEIGHT + 10, 12);
    glow.stroke({ width: 3, color: 0xffd700, alpha: 0.8 });
    return glow;
  }

  // ===== PRIVATE RENDERING METHODS =====

  private addCardFrame(container: PIXI.Container, element: Element): void {
    const frame = new PIXI.Graphics();
    
    // Outer frame
    frame.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 8);
    frame.fill({ color: 0x1a1a2a });
    
    // Inner frame
    frame.roundRect(4, 4, CARD_WIDTH - 8, CARD_HEIGHT - 8, 6);
    frame.fill({ color: 0x2a2a3a });
    
    // Element border
    frame.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 8);
    frame.stroke({ width: 3, color: ELEMENT_COLORS[element] });

    container.addChild(frame);
  }

  private addCardArt(container: PIXI.Container, card: CardType): void {
    const artArea = { x: 8, y: 20, width: CARD_WIDTH - 16, height: 80 };
    
    // Create mask
    const mask = new PIXI.Graphics();
    mask.roundRect(artArea.x, artArea.y, artArea.width, artArea.height, 4);
    mask.fill({ color: 0xffffff });

    const cardArtName = card.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const texture = this.textures.get(cardArtName);

    if (texture && texture !== PIXI.Texture.WHITE) {
      const sprite = new PIXI.Sprite(texture);
      
      // Scale to cover the art area
      const scaleX = artArea.width / texture.width;
      const scaleY = artArea.height / texture.height;
      const scale = Math.max(scaleX, scaleY);
      
      sprite.scale.set(scale);
      sprite.x = artArea.x + (artArea.width - texture.width * scale) / 2;
      sprite.y = artArea.y + (artArea.height - texture.height * scale) / 2;
      sprite.mask = mask;
      
      container.addChild(sprite);
    } else {
      // Fallback colored rectangle
      const fallback = new PIXI.Graphics();
      fallback.roundRect(artArea.x, artArea.y, artArea.width, artArea.height, 4);
      fallback.fill({ color: ELEMENT_COLORS[card.element], alpha: 0.3 });
      fallback.stroke({ width: 1, color: 0x666666 });
      container.addChild(fallback);
    }

    container.addChild(mask);
  }

  private addCardName(container: PIXI.Container, name: string): void {
    // Name banner
    const banner = new PIXI.Graphics();
    banner.roundRect(6, 105, CARD_WIDTH - 12, 25, 4);
    banner.fill({ color: 0x000000, alpha: 0.8 });
    banner.stroke({ width: 1, color: 0x4a4a5a });
    container.addChild(banner);

    // Name text
    const text = new PIXI.Text({
      text: name,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: CARD_WIDTH - 16,
      }
    });
    text.anchor.set(0.5);
    text.x = CARD_WIDTH / 2;
    text.y = 117;
    container.addChild(text);
  }

  private addManaCost(container: PIXI.Container, cost: number): void {
    // Mana gem
    const gem = new PIXI.Graphics();
    gem.circle(0, 0, 18);
    gem.fill({ color: 0x1e40af });
    gem.stroke({ width: 3, color: 0x60a5fa });
    gem.x = CARD_WIDTH - 22;
    gem.y = 22;
    container.addChild(gem);

    // Mana text
    const text = new PIXI.Text({
      text: cost.toString(),
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffffff,
      }
    });
    text.anchor.set(0.5);
    text.x = CARD_WIDTH - 22;
    text.y = 22;
    container.addChild(text);
  }

  private addMinionStats(
    container: PIXI.Container,
    attack: number,
    health: number,
    isDamaged: boolean = false
  ): void {
    // Attack gem
    const attackGem = new PIXI.Graphics();
    attackGem.circle(0, 0, 16);
    attackGem.fill({ color: 0xdc2626 });
    attackGem.stroke({ width: 3, color: 0xfca5a5 });
    attackGem.x = 22;
    attackGem.y = CARD_HEIGHT - 22;
    container.addChild(attackGem);

    const attackText = new PIXI.Text({
      text: attack.toString(),
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff,
      }
    });
    attackText.anchor.set(0.5);
    attackText.x = 22;
    attackText.y = CARD_HEIGHT - 22;
    container.addChild(attackText);

    // Health gem
    const healthGem = new PIXI.Graphics();
    healthGem.circle(0, 0, 16);
    healthGem.fill({ color: 0x059669 });
    healthGem.stroke({ width: 3, color: 0x6ee7b7 });
    healthGem.x = CARD_WIDTH - 22;
    healthGem.y = CARD_HEIGHT - 22;
    container.addChild(healthGem);

    const healthText = new PIXI.Text({
      text: health.toString(),
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: isDamaged ? 0xff6b6b : 0xffffff,
      }
    });
    healthText.anchor.set(0.5);
    healthText.x = CARD_WIDTH - 22;
    healthText.y = CARD_HEIGHT - 22;
    container.addChild(healthText);

    // Damage overlay
    if (isDamaged) {
      const overlay = new PIXI.Graphics();
      overlay.roundRect(2, 2, CARD_WIDTH - 4, CARD_HEIGHT - 4, 6);
      overlay.fill({ color: 0xff0000, alpha: 0.15 });
      container.addChild(overlay);
    }
  }
}