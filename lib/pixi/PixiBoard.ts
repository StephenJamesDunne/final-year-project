import * as PIXI from 'pixi.js';
import { Card as CardType, Minion } from '@/lib/types/game';
import { CardRenderer } from './rendering/CardRenderer';
import { BoardLayout } from './layout/BoardLayout';
import { UIManager } from './ui/UIManager';
import { HandRenderer } from './rendering/HandRenderer';
import { MinionRenderer } from './rendering/MinionRenderer';
import { BoardRenderer } from './rendering/BoardRenderer';

export interface BoardCallbacks {
  onCardPlay: (cardIndex: number) => void;
  onMinionClick: (minionId: string, isPlayer: boolean) => void;
  onTargetClick: (targetId: string) => void;
  onAIFaceClick: () => void;
  onEndTurn: () => void;
}

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
  private app: PIXI.Application | null = null;
  private cardRenderer: CardRenderer;
  private boardLayout: BoardLayout;
  private uiManager: UIManager;
  private handRenderer: HandRenderer;
  private minionRenderer: MinionRenderer;
  private boardRenderer: BoardRenderer;
  private callbacks: BoardCallbacks;

  private containers: {
    background?: PIXI.Container;
    aiHand?: PIXI.Container;
    aiBoard?: PIXI.Container;
    playerBoard?: PIXI.Container;
    playerHand?: PIXI.Container;
    ui?: PIXI.Container;
  } = {};

  constructor(callbacks: BoardCallbacks) {
    this.callbacks = callbacks;
    this.boardLayout = new BoardLayout();
    this.cardRenderer = new CardRenderer();
    this.uiManager = new UIManager(this.boardLayout);
    this.handRenderer = new HandRenderer(this.cardRenderer, this.boardLayout);
    this.minionRenderer = new MinionRenderer(this.cardRenderer, this.boardLayout);
    this.boardRenderer = new BoardRenderer(this.boardLayout);
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.app = new PIXI.Application();

    await this.app.init({
      canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x0f172a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.boardLayout.updateDimensions(this.app.screen.width, this.app.screen.height);

    await this.cardRenderer.loadAssets();
    this.setupContainers();
    this.renderBackground();
    this.createUIElements();

    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private setupContainers(): void {
    if (!this.app) return;

    this.containers.background = new PIXI.Container();
    this.containers.aiHand = new PIXI.Container();
    this.containers.aiBoard = new PIXI.Container();
    this.containers.playerBoard = new PIXI.Container();
    this.containers.playerHand = new PIXI.Container();
    this.containers.ui = new PIXI.Container();

    this.app.stage.addChild(this.containers.background);
    this.app.stage.addChild(this.containers.aiHand);
    this.app.stage.addChild(this.containers.aiBoard);
    this.app.stage.addChild(this.containers.playerBoard);
    this.app.stage.addChild(this.containers.playerHand);
    this.app.stage.addChild(this.containers.ui);
  }

  private renderBackground(): void {
    if (!this.containers.background) return;
    const bg = this.boardRenderer.createBackground();
    this.containers.background.addChild(bg);
  }

  private createUIElements(): void {
    if (!this.containers.ui) return;
    this.uiManager.createInitialUI(this.containers.ui, this.callbacks);
  }

  update(state: BoardState): void {
    this.clearDynamicContainers();

    this.handRenderer.renderAIHand(this.containers.aiHand!, state.aiHandCount);
    this.minionRenderer.renderAIBoard(
      this.containers.aiBoard!,
      state.aiBoard,
      state.selectedMinion,
      state.currentTurn,
      this.callbacks.onTargetClick
    );
    this.minionRenderer.renderPlayerBoard(
      this.containers.playerBoard!,
      state.playerBoard,
      state.selectedMinion,
      state.currentTurn,
      state.gameOver,
      this.callbacks.onMinionClick
    );
    this.handRenderer.renderPlayerHand(
      this.containers.playerHand!,
      state.playerHand,
      state.playerMana,
      state.currentTurn,
      state.gameOver,
      state.playerBoard.length,
      this.callbacks.onCardPlay
    );

    this.uiManager.updateUI(this.containers.ui!, state, this.callbacks);
  }

  private clearDynamicContainers(): void {
    this.containers.aiHand?.removeChildren();
    this.containers.aiBoard?.removeChildren();
    this.containers.playerBoard?.removeChildren();
    this.containers.playerHand?.removeChildren();
  }

  private handleResize(): void {
    if (!this.app) return;

    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    this.boardLayout.updateDimensions(this.app.screen.width, this.app.screen.height);

    this.containers.background?.removeChildren();
    this.renderBackground();

    this.uiManager.repositionOnResize();
  }

  destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));

    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
      this.app = null;
    }
  }
}