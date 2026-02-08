// Main file for PixiJS rendering. Inits PixiJS, assigns rendering to the corresponding
// renderer files, and handles window resizing and cleanups.

// BoardRenderer = static background of the game screen
// HandRenderer = player/AI hands
// MinionRenderer = Rendering minions played onto the board
// UIManager = player/AI portraits, buttons, combat log elements

import * as PIXI from 'pixi.js';
import { Card, Minion } from '@/lib/types/game';
import { CardRenderer } from './rendering/CardRenderer';
import { BoardLayout } from './layout/BoardLayout';
import { UIManager } from './ui/UIManager';
import { HandRenderer } from './rendering/HandRenderer';
import { MinionRenderer } from './rendering/MinionRenderer';
import { BoardRenderer } from './rendering/BoardRenderer';
import { COLORS } from './utils/StyleConstants';
import { HoverCardDisplay } from './ui/HoverCardDisplay';


// Callbacks passed from React to handle all user interactions are here.
// PixiJS detects clicks and calls corresponding functions to communicate with
// React/Zustand
export interface BoardCallbacks {
  onCardPlay: (cardIndex: number) => void;
  onMinionClick: (minionId: string, isPlayer: boolean) => void;
  onTargetClick: (targetId: string) => void;
  onAIFaceClick: () => void;
  onEndTurn: () => void;
}

// Complete game state needed for rendering
// Passed from React on evert state change through the update() function call
export interface BoardState {
  playerBoard: Minion[];
  aiBoard: Minion[];
  playerHand: Card[];
  aiHandCount: number;
  selectedMinion: string | null;
  currentTurn: 'player' | 'ai';
  playerMana: number;
  playerMaxMana: number;
  playerHealth: number;
  aiMana: number;
  aiMaxMana: number;
  aiHealth: number;
  gameOver: boolean;
  winner?: 'player' | 'ai';
  combatLog: string[];
  turnNumber: number;
  aiAction?: string;
}

// Rendering layer containers
// Each container holds sprites for a specific layer
// Added to stage in z-order sequence
interface RenderingContainers {
  background: PIXI.Container;
  aiHand: PIXI.Container;
  aiBoard: PIXI.Container;
  playerBoard: PIXI.Container;
  playerHand: PIXI.Container;
  ui: PIXI.Container;
}

export class PixiBoard {
  // Instance of Pixi app
  private app: PIXI.Application | null = null;

  // Flag to track if board has been destroyed
  private isDestroyed = false;

  // Renderers corresponding to different elements of the game
  private cardRenderer: CardRenderer;
  private boardLayout: BoardLayout;
  private uiManager: UIManager;
  private handRenderer: HandRenderer;
  private minionRenderer: MinionRenderer;
  private boardRenderer: BoardRenderer;
  private hoverCardDisplay: HoverCardDisplay;

  // Callbacks to communicate clicks/user interaction back to React
  private callbacks: BoardCallbacks;

  // Reference to bound resize handler
  // If this is passed as a callback without being bound, it'll lose its context
  // and "this" will become undefined, so binding prevents new function calls with 
  // wrong data
  private boundHandleResize: (() => void) | null = null;

  // Z-ordering here is important, similar to SFML, PIXI renders bottom to top:
  private containers: RenderingContainers | null = null;

  // Creates instances of each renderer before initializing PIXI instance
  constructor(callbacks: BoardCallbacks) {
    this.callbacks = callbacks;

    // hover functionality for detailed view of cards highlighted
    const hoverHandler = (card: Card | Minion | null, x: number, y:number) => {
      if (card) {
        this.showHoverCard(card, x, y);
      } else {
        this.hideHoverCard();
      }
    }

    
    this.boardLayout = new BoardLayout();
    this.cardRenderer = new CardRenderer();
    this.uiManager = new UIManager(this.boardLayout);
    this.handRenderer = new HandRenderer(this.cardRenderer, this.boardLayout, hoverHandler);
    this.minionRenderer = new MinionRenderer(this.cardRenderer, this.boardLayout, hoverHandler);
    this.boardRenderer = new BoardRenderer(this.boardLayout);
    this.hoverCardDisplay = new HoverCardDisplay();
  }

  // Initialization of PixiJS, set up rendering

  // Async initialization of flow:
  // 1. Create PIXI.Application
  // 2. Wait for WebGL initialization
  // 3. Update layout for the screen size
  // 4. Load card assets
  // 5. Set up containers and initial render
  // 6. Start listening for window resize
  // MUST be called before using the board

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.isDestroyed = false;

    // Create PixiJS app
    this.app = new PIXI.Application();

    // Init with WebGL renderer
    await this.app.init({
      canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: COLORS.BOARD.background,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Check if board is destroyed during async init
    if (this.isDestroyed || !this.app) return;

    // Align board size to fit the screen size
    this.boardLayout.updateDimensions(this.app.screen.width, this.app.screen.height);

    // Load card art and frame assets
    await this.cardRenderer.loadAssets();

    // Check for board destruction again after second async operation
    if (this.isDestroyed || !this.app) return;

    // Set up rendering layers
    this.setupContainers();

    // Render static background
    this.renderBackground();

    // Create initial UI elements
    this.createUIElements();

    // Listen for window resize events
    this.boundHandleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.boundHandleResize);
  }

  // Create and add rendering containers to stage
  // Container creation order defines z-order
  private setupContainers(): void {
    if (!this.app) return;

    this.containers = {
      background: new PIXI.Container(),
      aiHand: new PIXI.Container(),
      aiBoard: new PIXI.Container(),
      playerBoard: new PIXI.Container(),
      playerHand: new PIXI.Container(),
      ui: new PIXI.Container(),
    };

    // Add containers in z-order (bottom to top)
    this.app.stage.addChild(this.containers.background);
    this.app.stage.addChild(this.containers.aiHand);
    this.app.stage.addChild(this.containers.aiBoard);
    this.app.stage.addChild(this.containers.playerBoard);
    this.app.stage.addChild(this.containers.playerHand);
    this.app.stage.addChild(this.containers.ui);

    // Add hover card display at highest z-order
    this.app.stage.addChild(this.hoverCardDisplay.getContainer());

    // Need this to enable z-ordering
    this.app.stage.sortableChildren = true;
  }

  // Render static background (base color, board zones, decorative elements)
  private renderBackground(): void {
    if (!this.containers) return;
    const bg = this.boardRenderer.createBackground();
    this.containers.background.addChild(bg);
  }

  // UI elements that persist through entire game session
  // Portraits for player/AI, deck indicators, turn indicator,
  // Combat log, end turn button
  private createUIElements(): void {
    if (!this.containers) return;
    this.uiManager.createInitialUI(this.containers.ui, this.callbacks);
  }

  // Update the game board with new state. This gets
  // called by PixiGameBoard.tsx React component whenever Zustand state changes
  // Flow:
  // 1. Clear dynamic containers (hands, boards)
  // 2. Re-render with new state
  // 3. Update UI elements
  update(state: BoardState): void {
    if (!this.containers) return;

    this.clearDynamicContainers();

    this.handRenderer.renderAIHand(this.containers.aiHand, state.aiHandCount);
    this.minionRenderer.renderAIBoard(
      this.containers.aiBoard,
      state.aiBoard,
      state.selectedMinion,
      state.currentTurn,
      this.callbacks.onTargetClick
    );
    this.minionRenderer.renderPlayerBoard(
      this.containers.playerBoard,
      state.playerBoard,
      state.selectedMinion,
      state.currentTurn,
      state.gameOver,
      this.callbacks.onMinionClick
    );
    this.handRenderer.renderPlayerHand(
      this.containers.playerHand,
      state.playerHand,
      state.playerMana,
      state.currentTurn,
      state.gameOver,
      state.playerBoard.length,
      this.callbacks.onCardPlay
    );

    this.uiManager.updateUI(this.containers.ui, state, this.callbacks);
  }

  // Clear containers that change every update
  // Only dynamic elements: hands, boards, UI
  private clearDynamicContainers(): void {
    if (!this.containers) return;

    this.destroyChildren(this.containers.aiHand);
    this.destroyChildren(this.containers.aiBoard);
    this.destroyChildren(this.containers.playerBoard);
    this.destroyChildren(this.containers.playerHand);
  }

  // Destroy all children of a container
  // Properly cleans up parent container, sprite and its children
  private destroyChildren(container: PIXI.Container): void {
    while (container.children.length > 0) {
      const child = container.children[0];
      container.removeChild(child);
      child.destroy({ children: true });
    }
  }

  private handleResize(): void {
    if (!this.app || !this.containers) return;

    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    this.boardLayout.updateDimensions(this.app.screen.width, this.app.screen.height);

    this.destroyChildren(this.containers.background);
    this.renderBackground();

    this.uiManager.repositionOnResize();
  }

  // Functions to allow show/hide functionality for the tooltip
  showHoverCard(card: Card | Minion, globalX: number, globalY: number): void {
    if (!this.app) return;
    this.hoverCardDisplay.show(card, globalX, globalY, this.app.screen.width, this.app.screen.height);
  }

  hideHoverCard(): void {
    this.hoverCardDisplay.hide();
  }

  destroy(): void {
    this.isDestroyed = true;

    if (this.boundHandleResize) {
      window.removeEventListener('resize', this.boundHandleResize);
      this.boundHandleResize = null;
    }

    if (this.app?.renderer) {
      this.app.destroy(true, {
        children: true,
        texture: true
      });
    }
    this.app = null;

    this.containers = null;
  }
}