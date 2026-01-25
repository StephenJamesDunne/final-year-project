// Main file for PixiJS rendering. Inits PixiJS, assigns rendering to the corresponding
// renderer files, and handles window resizing and cleanups.

// BoardRenderer = static background of the game screen
// HandRenderer = player/AI hands
// MinionRenderer = Rendering minions played onto the board
// UIManager = player/AI portraits, buttons, combat log elements

import * as PIXI from 'pixi.js';
import { Card as CardType, Minion } from '@/lib/types/game';
import { CardRenderer } from './rendering/CardRenderer';
import { BoardLayout } from './layout/BoardLayout';
import { UIManager } from './ui/UIManager';
import { HandRenderer } from './rendering/HandRenderer';
import { MinionRenderer } from './rendering/MinionRenderer';
import { BoardRenderer } from './rendering/BoardRenderer';
import { COLORS } from './utils/StyleConstants';


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
  playerHand: CardType[];
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

export class PixiBoard {
  // Instance of Pixi app
  private app: PIXI.Application | null = null;
  private isDestroyed = false;

  // Renderers corresponding to different elements of the game
  private cardRenderer: CardRenderer;
  private boardLayout: BoardLayout;
  private uiManager: UIManager;
  private handRenderer: HandRenderer;
  private minionRenderer: MinionRenderer;
  private boardRenderer: BoardRenderer;

  // Callbacks to communicate clicks/user interaction back to React
  private callbacks: BoardCallbacks;

  // Reference to bound resize handler
  // If this is passed as a callback without being bound, it'll lose its context
  // and "this" will become undefined, so binding prevents new function calls with 
  // wrong data
  private boundHandleResize: (() => void) | null = null;

  // Z-ordering here is important, similar to SFML, PIXI renders bottom to top:
  private containers: {
    background: PIXI.Container;
    aiHand: PIXI.Container;
    aiBoard: PIXI.Container;
    playerBoard: PIXI.Container;
    playerHand: PIXI.Container;
    ui: PIXI.Container;
  } | null = null;

  // Creates instances of each renderer before initializing PIXI instance
  constructor(callbacks: BoardCallbacks) {
    this.callbacks = callbacks;
    this.boardLayout = new BoardLayout();
    this.cardRenderer = new CardRenderer();
    this.uiManager = new UIManager(this.boardLayout);
    this.handRenderer = new HandRenderer(this.cardRenderer, this.boardLayout);
    this.minionRenderer = new MinionRenderer(this.cardRenderer, this.boardLayout);
    this.boardRenderer = new BoardRenderer(this.boardLayout);
  }

  // Create the instance of PIXI and init
  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.isDestroyed = false;

    this.app = new PIXI.Application();

    await this.app.init({
      canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: COLORS.BOARD.background,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    if (this.isDestroyed || !this.app) return;

    // Align board size to fit the screen size
    this.boardLayout.updateDimensions(this.app.screen.width, this.app.screen.height);

    await this.cardRenderer.loadAssets();
    if (this.isDestroyed || !this.app) return;

    this.setupContainers();
    this.renderBackground();
    this.createUIElements();

    // Listen for window resize events
    this.boundHandleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.boundHandleResize);
  }

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

    this.app.stage.addChild(this.containers.background);
    this.app.stage.addChild(this.containers.aiHand);
    this.app.stage.addChild(this.containers.aiBoard);
    this.app.stage.addChild(this.containers.playerBoard);
    this.app.stage.addChild(this.containers.playerHand);
    this.app.stage.addChild(this.containers.ui);
  }

  private renderBackground(): void {
    if (!this.containers) return;
    const bg = this.boardRenderer.createBackground();
    this.containers.background.addChild(bg);
  }

  private createUIElements(): void {
    if (!this.containers) return;
    this.uiManager.createInitialUI(this.containers.ui, this.callbacks);
  }

  // Update the game board with new state. This gets
  // called by PixiGameBoard.tsx whenever React state changes
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

  private clearDynamicContainers(): void {
    if (!this.containers) return;

    this.destroyChildren(this.containers.aiHand);
    this.destroyChildren(this.containers.aiBoard);
    this.destroyChildren(this.containers.playerBoard);
    this.destroyChildren(this.containers.playerHand);
  }

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