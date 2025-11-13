# Presentation Notes

## 1. Project Overview

### Five Realms (Cúige na hÉireann) is a digital card battle game inspired by Irish mythology, built as a Hearthstone-like experience as a web app.

### **Technology Stack**
- **Next.js 16.0.0 - React framework with App Router**
- **React 19.1.0 - UI library**
- **TypeScript 5 - Type safety**
- **PixiJS 8.14.0 - Hardware-accelerated 2D rendering**
- **Zustand 5.0.8 - Lightweight state management**
- **Framer Motion 12 - Card animations**
- **Tailwind CSS 4 - Styling system**

## 2. Design Goals

### **Game Vision**
- **Theming - Irish Mythology theme and lore on the five provinces of ancient Ireland**
- **Web Dev + Database Usage - Apply experience from work placement in web design and database usage to a game**
- **Complex AI - usage of Bayesian and Hidden Markov modelling techniques to train AI opponents on game data**
- **PixiJS Rendering - Learning and implementing GPU-accelerated 2D rendering through Pixi**

## 3. Current Project Milestones

### **Game Vision**
- **Core gameplay loop -> mana, turns, combat**
- **Basic AI Opponent System with simple heuristics for making plays**
- **Foundation of PixiJS implemented**
- **Fixes for server-side rendering (SSR) hydration issues**

### Future Improvements on the Current Project
Currently, battleStore.ts is one massive file with a gigantic store where all changes to states on the board are checked and subscribed to:

```typescript
export const useBattleStore = create<BattleStore>((set, get) => ({
  // All 500 lines here
}));
```

Next improvement to be made is to split this one store into Slices:
```typescript
// lib/store/slices/playerSlice.ts
export const createPlayerSlice = (set, get) => ({
  player: { health: 30, mana: 1, hand: [], board: [], deck: [] },
  playCard: (cardIndex: number) => { /* ... */ },
  // Other player-specific actions
});

// lib/store/slices/aiSlice.ts
export const createAISlice = (set, get) => ({
  ai: { health: 30, mana: 1, hand: [], board: [], deck: [] },
  executeAITurn: async () => { /* ... */ },
  // Other AI-specific actions
});

// lib/store/slices/combatSlice.ts
export const createCombatSlice = (set, get) => ({
  selectedMinion: null,
  combatLog: [],
  attack: (attackerId, targetId) => { /* ... */ },
  attackHero: (attackerId) => { /* ... */ },
});

// lib/store/slices/gameSlice.ts
export const createGameSlice = (set, get) => ({
  currentTurn: 'player',
  turnNumber: 1,
  gameOver: false,
  winner: undefined,
  endTurn: async () => { /* ... */ },
  resetGame: () => { /* ... */ },
});

// lib/store/battleStore.ts (Now just composition)
import { createPlayerSlice } from './slices/playerSlice';
import { createAISlice } from './slices/aiSlice';
import { createCombatSlice } from './slices/combatSlice';
import { createGameSlice } from './slices/gameSlice';

export const useBattleStore = create<BattleStore>((...args) => ({
  ...createPlayerSlice(...args),
  ...createAISlice(...args),
  ...createCombatSlice(...args),
  ...createGameSlice(...args),
}));
```

Similar issues can be seen with the PixiBoard.ts file, one large board manager file:

```typescript
export class PixiBoard {
  // All 450 lines handling rendering, input, layout
}
```

This will have to be changed into sub-managers and extracted into their own files:

```typescript
// lib/pixi/managers/InputManager.ts
export class InputManager {
  constructor(private callbacks: BoardCallbacks) {}
  
  setupCardInteractivity(card: PIXI.Container, index: number) { /* ... */ }
  setupMinionInteractivity(minion: PIXI.Container, minionId: string, isPlayer: boolean) { /* ... */ }
  setupEndTurnButton(button: PIXI.Container, enabled: boolean) { /* ... */ }
}

// lib/pixi/managers/LayoutManager.ts
export class LayoutManager {
  constructor(private boardLayout: BoardLayout) {}
  
  positionPlayerHand(cards: PIXI.Container[], state: BoardState) { /* ... */ }
  positionPlayerBoard(minions: PIXI.Container[], state: BoardState) { /* ... */ }
  positionAIBoard(minions: PIXI.Container[], state: BoardState) { /* ... */ }
}

// lib/pixi/managers/UIManager.ts
export class UIManager {
  constructor(private uiRenderer: UIRenderer) {}
  
  updateHealthDisplays(state: BoardState) { /* ... */ }
  updateCombatLog(state: BoardState) { /* ... */ }
  updateTurnIndicator(state: BoardState) { /* ... */ }
}

// lib/pixi/PixiBoard.ts (Simplified orchestrator)
export class PixiBoard {
  private inputManager: InputManager;
  private layoutManager: LayoutManager;
  private uiManager: UIManager;
  
  constructor(callbacks: BoardCallbacks) {
    this.inputManager = new InputManager(callbacks);
    this.layoutManager = new LayoutManager(this.boardLayout);
    this.uiManager = new UIManager(this.uiRenderer);
  }
  
  update(state: BoardState): void {
    this.clearDynamicContainers();
    
    // Delegate to specialized managers
    this.renderPlayerHand(state);
    this.renderPlayerBoard(state);
    this.renderAIBoard(state);
    this.uiManager.updateAll(state);
  }
}
```

Monolithic file: CardRenderer.ts (400+ lines)
Solution:  similar to PixiBoard, split into multiple renderer files:

```typescript
// lib/pixi/renderers/CardBaseRenderer.ts
export class CardBaseRenderer {
  createCardBackground(card: Card): PIXI.Graphics { /* ... */ }
  createCardFrame(card: Card): PIXI.Graphics { /* ... */ }
  createCardShadow(): PIXI.Graphics { /* ... */ }
}

// lib/pixi/renderers/CardBadgeRenderer.ts
export class CardBadgeRenderer {
  createManaCrystal(cost: number): PIXI.Container { /* ... */ }
  createAttackBadge(attack: number): PIXI.Container { /* ... */ }
  createHealthBadge(health: number, isDamaged: boolean): PIXI.Container { /* ... */ }
  createElementGem(element: string): PIXI.Container { /* ... */ }
}

// lib/pixi/renderers/CardArtRenderer.ts
export class CardArtRenderer {
  async loadCardArt(imageUrl: string): Promise<PIXI.Sprite> { /* ... */ }
  createArtPlaceholder(card: Card): PIXI.Container { /* ... */ }
}

// lib/pixi/CardRenderer.ts (Composition)
export class CardRenderer {
  private baseRenderer: CardBaseRenderer;
  private badgeRenderer: CardBadgeRenderer;
  private artRenderer: CardArtRenderer;
  
  createCard(card: Card, options?: CardOptions): PIXI.Container {
    const container = new PIXI.Container();
    
    // Compose from sub-renderers
    container.addChild(this.baseRenderer.createCardShadow());
    container.addChild(this.baseRenderer.createCardBackground(card));
    container.addChild(this.baseRenderer.createCardFrame(card));
    container.addChild(this.badgeRenderer.createManaCrystal(card.manaCost));
    // ...
    
    return container;
  }
}
```

The battle.tsx page currently re-renders entirely on ANY change in state:

```typescript
const {
  player,
  ai,
  selectedMinion,
  currentTurn,
  gameOver,
  winner,
  combatLog,
  turnNumber,
  aiAction,
  playCard,
  selectMinion,
  attack,
  attackHero,
  endTurn,
  resetGame,
} = useBattleStore();
```

Fix: selective subscribers to the store instead of one giant one:
```ts
// lib/store/selectors.ts
export const selectPlayerBoard = (state: BattleStore) => state.player.board;
export const selectPlayerHand = (state: BattleStore) => state.player.hand;
export const selectPlayerHealth = (state: BattleStore) => state.player.health;
export const selectPlayerMana = (state: BattleStore) => state.player.mana;
export const selectAIBoard = (state: BattleStore) => state.ai.board;
export const selectCurrentTurn = (state: BattleStore) => state.currentTurn;
export const selectGameOver = (state: BattleStore) => state.gameOver;

// battle/page.tsx (Optimized)
const playerBoard = useBattleStore(selectPlayerBoard);
const playerHand = useBattleStore(selectPlayerHand);
const currentTurn = useBattleStore(selectCurrentTurn);
// ... only subscribe to what you need

// Actions don't cause re-renders
const playCard = useBattleStore(state => state.playCard);
const endTurn = useBattleStore(state => state.endTurn);
```

High priority performance increase: New sprites are being created every frame:

```ts
renderPlayerHand(state: BoardState): void {
  state.playerHand.forEach((card, index) => {
    const cardSprite = this.cardRenderer.createCard(card); // New allocation
    this.containers.playerHand!.addChild(cardSprite);
  });
}
```

Fix: Sprite pooling:

```ts
// lib/pixi/SpritePool.ts
export class SpritePool {
  private pool: Map<string, PIXI.Container[]> = new Map();
  
  acquire(type: string, factory: () => PIXI.Container): PIXI.Container {
    const pool = this.pool.get(type) || [];
    
    if (pool.length > 0) {
      return pool.pop()!; // ✅ Reuse existing sprite
    }
    
    return factory(); // Create new only if needed
  }
  
  release(type: string, sprite: PIXI.Container): void {
    sprite.visible = false;
    sprite.removeFromParent();
    
    const pool = this.pool.get(type) || [];
    pool.push(sprite);
    this.pool.set(type, pool);
  }
  
  clear(): void {
    this.pool.forEach(pool => {
      pool.forEach(sprite => sprite.destroy());
    });
    this.pool.clear();
  }
}

// PixiBoard.ts (Using pool)
export class PixiBoard {
  private spritePool: SpritePool;
  
  renderPlayerHand(state: BoardState): void {
    state.playerHand.forEach((card, index) => {
      const cardSprite = this.spritePool.acquire('card', () => 
        this.cardRenderer.createCard(card)
      );
      // Update sprite properties instead of recreating
      this.updateCardSprite(cardSprite, card);
      this.containers.playerHand!.addChild(cardSprite);
    });
  }
  
  clearDynamicContainers(): void {
    // Return sprites to pool instead of destroying
    this.containers.playerHand?.children.forEach(child => {
      this.spritePool.release('card', child as PIXI.Container);
    });
    this.containers.playerHand?.removeChildren();
  }
}
```

Low prio for now: animation system enhancements:

```ts
// lib/pixi/animations/cardAnimationSystem.ts
export class CardAnimations {
  // ADD: Smooth card draw animation
  static async animateCardDraw(
    card: PIXI.Container,
    deckPos: { x: number; y: number },
    handPos: { x: number; y: number }
  ): Promise<void> {
    card.position.set(deckPos.x, deckPos.y);
    card.alpha = 0;
    card.rotation = Math.PI / 4;
    
    await this.smoothTransition(card, {
      x: handPos.x,
      y: handPos.y,
      alpha: 1,
      rotation: 0,
    }, 500);
  }
  
  // ADD: Mana crystal gain animation
  static animateManaCrystal(crystal: PIXI.Container): void {
    const startScale = crystal.scale.x;
    
    gsap.timeline()
      .to(crystal.scale, { x: 1.5, y: 1.5, duration: 0.2 })
      .to(crystal.scale, { x: startScale, y: startScale, duration: 0.2 })
      .fromTo(crystal, 
        { pixi: { brightness: 1.5 } }, 
        { pixi: { brightness: 1 }, duration: 0.3 }
      );
  }
  
  // ADD: Victory/defeat screen
  static async showGameOverAnimation(
    winner: 'player' | 'ai',
    stage: PIXI.Container
  ): Promise<void> {
    const overlay = new PIXI.Graphics();
    overlay.rect(0, 0, stage.width, stage.height);
    overlay.fill({ color: 0x000000, alpha: 0 });
    stage.addChild(overlay);
    
    await this.smoothTransition(overlay, { alpha: 0.8 }, 500);
    
    const text = new PIXI.Text({
      text: winner === 'player' ? 'VICTORY!' : 'DEFEAT',
      style: {
        fontSize: 72,
        fill: winner === 'player' ? 0xFFD700 : 0xFF4444,
      }
    });
    text.anchor.set(0.5);
    text.position.set(stage.width / 2, stage.height / 2);
    text.scale.set(0);
    
    stage.addChild(text);
    
    await this.smoothTransition(text.scale, { x: 1, y: 1 }, 600);
  }
}
```

