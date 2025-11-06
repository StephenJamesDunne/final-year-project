import * as PIXI from 'pixi.js';
import { Card as CardType, Minion } from '@/lib/types/game';
import { CardRenderer } from './CardRenderer';
import { BoardLayout } from './BoardLayout';
import { UIRenderer } from './UIRenderer';

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

/**
 * Main PixiJS board manager
 * Orchestrates the game board rendering and interactions
 */
export class PixiBoard {
  private app: PIXI.Application | null = null;
  private cardRenderer: CardRenderer;
  private boardLayout: BoardLayout;
  private uiRenderer: UIRenderer;
  private callbacks: BoardCallbacks;
  
  // Container references
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
    this.cardRenderer = new CardRenderer();
    this.boardLayout = new BoardLayout();
    this.uiRenderer = new UIRenderer();
  }

  /**
   * Initialize the PixiJS application
   */
  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.app = new PIXI.Application();
    
    await this.app.init({
      canvas,
      width: 1400,
      height: 900,
      backgroundColor: 0x0f172a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    await this.cardRenderer.loadAssets();
    this.setupContainers();
    this.renderBackground();
  }

  /**
   * Set up the container hierarchy
   */
  private setupContainers(): void {
    if (!this.app) return;

    // Create containers in rendering order (back to front)
    this.containers.background = new PIXI.Container();
    this.containers.aiHand = new PIXI.Container();
    this.containers.aiBoard = new PIXI.Container();
    this.containers.playerBoard = new PIXI.Container();
    this.containers.playerHand = new PIXI.Container();
    this.containers.ui = new PIXI.Container();

    // Add to stage
    this.app.stage.addChild(this.containers.background);
    this.app.stage.addChild(this.containers.aiHand);
    this.app.stage.addChild(this.containers.aiBoard);
    this.app.stage.addChild(this.containers.playerBoard);
    this.app.stage.addChild(this.containers.playerHand);
    this.app.stage.addChild(this.containers.ui);
  }

  /**
   * Render the background and board zones
   */
  private renderBackground(): void {
    if (!this.containers.background) return;

    const bg = this.boardLayout.createBackground();
    this.containers.background.addChild(bg);
  }

  /**
   * Update the entire board state
   */
  update(state: BoardState): void {
    this.clearContainers();
    
    this.renderAIHand(state);
    this.renderAIBoard(state);
    this.renderPlayerBoard(state);
    this.renderPlayerHand(state);
    this.renderUI(state);
  }

  /**
   * Clear all dynamic containers
   */
  private clearContainers(): void {
    Object.entries(this.containers).forEach(([key, container]) => {
      if (key !== 'background' && container) {
        container.removeChildren();
      }
    });
  }

  /**
   * Render AI hand (card backs)
   */
  private renderAIHand(state: BoardState): void {
    if (!this.containers.aiHand) return;

    const positions = this.boardLayout.getAIHandPositions(state.aiHandCount);
    
    positions.forEach(pos => {
      const cardBack = this.cardRenderer.createCardBack();
      cardBack.x = pos.x;
      cardBack.y = pos.y;
      this.containers.aiHand!.addChild(cardBack);
    });
  }

  /**
   * Render AI board (minions)
   */
  private renderAIBoard(state: BoardState): void {
    if (!this.containers.aiBoard) return;

    const positions = this.boardLayout.getAIBoardPositions(state.aiBoard.length);
    
    state.aiBoard.forEach((minion, i) => {
      const card = this.cardRenderer.createMinionCard(minion, false);
      card.x = positions[i].x;
      card.y = positions[i].y;

      // Add targeting glow if player has selected a minion
      if (state.selectedMinion) {
        const glow = this.cardRenderer.createTargetGlow();
        card.addChildAt(glow, 0);
        
        card.eventMode = 'static';
        card.cursor = 'crosshair';
        card.on('pointerdown', () => this.callbacks.onTargetClick(minion.instanceId));
      }

      this.containers.aiBoard!.addChild(card);
    });
  }

  /**
   * Render player board (minions)
   */
  private renderPlayerBoard(state: BoardState): void {
    if (!this.containers.playerBoard) return;

    const positions = this.boardLayout.getPlayerBoardPositions(state.playerBoard.length);
    
    state.playerBoard.forEach((minion, i) => {
      const card = this.cardRenderer.createMinionCard(minion, true);
      card.x = positions[i].x;
      card.y = positions[i].y;

      const canAttack = minion.canAttack && state.currentTurn === 'player' && !state.gameOver;

      if (canAttack) {
        const glow = this.cardRenderer.createAttackGlow();
        card.addChildAt(glow, 0);
        
        card.eventMode = 'static';
        card.cursor = 'pointer';
        card.on('pointerdown', () => this.callbacks.onMinionClick(minion.instanceId, true));
      }

      this.containers.playerBoard!.addChild(card);
    });
  }

  /**
   * Render player hand
   */
  private renderPlayerHand(state: BoardState): void {
    if (!this.containers.playerHand) return;

    const positions = this.boardLayout.getPlayerHandPositions(state.playerHand.length);
    
    state.playerHand.forEach((card, i) => {
      const cardSprite = this.cardRenderer.createCard(card);
      cardSprite.x = positions[i].x;
      cardSprite.y = positions[i].y;

      const canPlay = card.manaCost <= state.playerMana && 
                      state.currentTurn === 'player' && 
                      !state.gameOver;

      if (!canPlay) {
        cardSprite.alpha = 0.5;
      } else {
        cardSprite.eventMode = 'static';
        cardSprite.cursor = 'pointer';
        
        cardSprite.on('pointerdown', () => this.callbacks.onCardPlay(i));
        cardSprite.on('pointerover', () => {
          cardSprite.scale.set(1.1);
          cardSprite.y -= 20;
        });
        cardSprite.on('pointerout', () => {
          cardSprite.scale.set(1);
          cardSprite.y += 20;
        });
      }

      this.containers.playerHand!.addChild(cardSprite);
    });
  }

  /**
   * Render UI elements (health, mana, buttons, log)
   */
  private renderUI(state: BoardState): void {
    if (!this.containers.ui) return;

    // AI Health Display
    const aiHealth = this.uiRenderer.createHealthDisplay(
      state.aiHealth,
      state.aiMana,
      state.aiMaxMana,
      'AI Opponent',
      true
    );
    aiHealth.x = 50;
    aiHealth.y = 70;

    if (state.selectedMinion) {
      aiHealth.eventMode = 'static';
      aiHealth.cursor = 'crosshair';
      aiHealth.on('pointerdown', this.callbacks.onAIFaceClick);
      
      const glow = this.cardRenderer.createTargetGlow();
      aiHealth.addChildAt(glow, 0);
    }

    this.containers.ui.addChild(aiHealth);

    // Player Health Display
    const playerHealth = this.uiRenderer.createHealthDisplay(
      state.playerHealth,
      state.playerMana,
      state.playerMaxMana,
      'You',
      false
    );
    playerHealth.x = 1150;
    playerHealth.y = 710;
    this.containers.ui.addChild(playerHealth);

    // End Turn Button
    const endTurnBtn = this.uiRenderer.createEndTurnButton(
      state.currentTurn === 'player' && !state.gameOver
    );
    endTurnBtn.x = 620;
    endTurnBtn.y = 820;
    
    if (state.currentTurn === 'player' && !state.gameOver) {
      endTurnBtn.on('pointerdown', this.callbacks.onEndTurn);
    }
    
    this.containers.ui.addChild(endTurnBtn);

    // Combat Log
    const log = this.uiRenderer.createCombatLog(state.combatLog, state.aiAction);
    log.x = 1050;
    log.y = 200;
    this.containers.ui.addChild(log);

    // Turn Indicator
    const turnText = this.uiRenderer.createTurnIndicator(
      state.turnNumber,
      state.currentTurn
    );
    turnText.x = 700;
    turnText.y = 70;
    this.containers.ui.addChild(turnText);
  }

  /**
   * Destroy the PixiJS application
   */
  destroy(): void {
    if (this.app) {
      this.app.destroy(true);
      this.app = null;
    }
  }
}