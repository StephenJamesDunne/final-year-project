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
 * Main PixiJS board manager - Hearthstone-style layout
 * Handles the game board rendering and interactions
 */
export class PixiBoard {
  private app: PIXI.Application | null = null;
  private cardRenderer: CardRenderer;
  private boardLayout: BoardLayout;
  private uiRenderer: UIRenderer;
  private callbacks: BoardCallbacks;

  // UI element references (for updates)
  private aiHealthDisplay!: PIXI.Container;
  private playerHealthDisplay!: PIXI.Container;
  private aiDeckIndicator!: PIXI.Container;
  private playerDeckIndicator!: PIXI.Container;
  private combatLogDisplay!: PIXI.Container;
  private turnIndicator!: PIXI.Container;
  private endTurnButton!: PIXI.Container;

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
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x0f172a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Update layout with actual dimensions of the canvas
    this.boardLayout.updateDimensions(this.app.screen.width, this.app.screen.height);

    await this.cardRenderer.loadAssets();
    this.setupContainers();
    this.renderBackground();
    this.createUIElements();

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
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

    // Add to stage of application so that they are rendered
    // This is how PixiJS knows what to draw and in what order
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
   * Create persistent UI elements (Hearthstone-style layout)
   */
  private createUIElements(): void {
    if (!this.containers.ui) return;

    // AI Portrait (top center)
    this.aiHealthDisplay = this.uiRenderer.createHeroPortrait(30, 1, 1, 'AI Opponent', true);
    const aiPortraitPos = this.boardLayout.getAIPortraitPosition();
    this.aiHealthDisplay.x = aiPortraitPos.x;
    this.aiHealthDisplay.y = aiPortraitPos.y;
    this.containers.ui.addChild(this.aiHealthDisplay);

    // Player Portrait (bottom center)
    this.playerHealthDisplay = this.uiRenderer.createHeroPortrait(30, 1, 1, 'You', false);
    const playerPortraitPos = this.boardLayout.getPlayerPortraitPosition();
    this.playerHealthDisplay.x = playerPortraitPos.x;
    this.playerHealthDisplay.y = playerPortraitPos.y;
    this.containers.ui.addChild(this.playerHealthDisplay);

    // AI Deck (top right)
    this.aiDeckIndicator = this.uiRenderer.createDeckIndicator(30, true);
    const aiDeckPos = this.boardLayout.getAIDeckPosition();
    this.aiDeckIndicator.x = aiDeckPos.x;
    this.aiDeckIndicator.y = aiDeckPos.y;
    this.containers.ui.addChild(this.aiDeckIndicator);

    // Player Deck (bottom left)
    this.playerDeckIndicator = this.uiRenderer.createDeckIndicator(30, false);
    const playerDeckPos = this.boardLayout.getPlayerDeckPosition();
    this.playerDeckIndicator.x = playerDeckPos.x;
    this.playerDeckIndicator.y = playerDeckPos.y;
    this.containers.ui.addChild(this.playerDeckIndicator);

    // Combat Log (left side - semi-transparent)
    this.combatLogDisplay = this.uiRenderer.createCombatLog([]);
    const logPos = this.boardLayout.getCombatLogPosition();
    this.combatLogDisplay.x = logPos.x;
    this.combatLogDisplay.y = logPos.y;
    this.combatLogDisplay.alpha = 0.8;
    this.containers.ui.addChild(this.combatLogDisplay);

    // Turn Indicator (top left corner)
    this.turnIndicator = this.uiRenderer.createTurnIndicator(1, 'player');
    const turnPos = this.boardLayout.getTurnIndicatorPosition();
    this.turnIndicator.x = turnPos.x;
    this.turnIndicator.y = turnPos.y;
    this.containers.ui.addChild(this.turnIndicator);

    // End Turn Button (right side, middle - Hearthstone style)
    this.endTurnButton = this.uiRenderer.createEndTurnButton(true);
    const buttonPos = this.boardLayout.getEndTurnButtonPosition();
    this.endTurnButton.x = buttonPos.x;
    this.endTurnButton.y = buttonPos.y;
    this.endTurnButton.on('pointerdown', () => this.callbacks.onEndTurn());
    this.containers.ui.addChild(this.endTurnButton);
  }

  /**
   * Update the entire board state
   */
  update(state: BoardState): void {
    this.clearDynamicContainers();

    this.renderAIHand(state);
    this.renderAIBoard(state);
    this.renderPlayerBoard(state);
    this.renderPlayerHand(state);
    this.updateUI(state);
  }

  /**
   * Clear all dynamic containers (cards only, not UI)
   */
  private clearDynamicContainers(): void {
    this.containers.aiHand?.removeChildren();
    this.containers.aiBoard?.removeChildren();
    this.containers.playerBoard?.removeChildren();
    this.containers.playerHand?.removeChildren();
  }

  /**
   * Render AI hand (card backs at top)
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

      card.eventMode = 'static';
      card.cursor = 'pointer';

      const minionId = minion.instanceId;

      card.on('pointerdown', () => {
        console.log('AI minion clicked:', minionId);
        this.callbacks.onTargetClick(minionId);
      });

      if (state.selectedMinion && state.currentTurn === 'player') {
        // Add red tint to indicate targetable
        card.tint = 0xff6666;
      } else {
        card.tint = 0xffffff;
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

      // Check if minion can attack
      const canAttack = minion.canAttack &&
        state.currentTurn === 'player' &&
        !state.gameOver;

      // Check if minion is selected
      const isSelected = state.selectedMinion === minion.instanceId;

      if (isSelected) {
        card.tint = 0x66ff66; // Green tint for selected
      } else if (canAttack) {
        card.tint = 0xaaffaa; // Light green for attackable
      } else {
        card.tint = 0xffffff; // Normal
      }

      if (canAttack || isSelected) {
        card.eventMode = 'static';
        card.cursor = 'pointer';

        // Capture minion ID
        const minionId = minion.instanceId;

        // Click to select/deselect
        card.on('pointerdown', () => {
          console.log('Player minion clicked:', minionId, 'canAttack:', canAttack);
          this.callbacks.onMinionClick(minionId, true);
        });

        // Hover effect
        if (!isSelected && canAttack) {
          card.on('pointerover', () => { card.alpha = 0.9; });
          card.on('pointerout', () => { card.alpha = 1.0; });
        }
      } else {
        card.eventMode = 'auto';
        card.cursor = 'default';
      }

      this.containers.playerBoard!.addChild(card);
    });
  }

  /**
   * Render player hand (curved arc at bottom)
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
        !state.gameOver &&
        state.playerBoard.length < 7; // Max 7 minions on board

      if (!canPlay) {
        cardSprite.alpha = 0.5;
      } else {
        cardSprite.eventMode = 'static';
        cardSprite.cursor = 'pointer';

        cardSprite.on('pointerdown', () => this.callbacks.onCardPlay(i));

        // Hearthstone-style hover effect
        cardSprite.on('pointerover', () => {
          cardSprite.scale.set(1.15);
          cardSprite.y -= 30;
          cardSprite.zIndex = 1000; // Bring to front
        });
        cardSprite.on('pointerout', () => {
          cardSprite.scale.set(1);
          cardSprite.y = positions[i].y;
          cardSprite.zIndex = 0;
        });
      }

      this.containers.playerHand!.addChild(cardSprite);
    });

    // Enable sorting by zIndex
    if (this.containers.playerHand) {
      this.containers.playerHand.sortableChildren = true;
    }
  }

  /**
   * Update UI elements (portraits, decks, buttons, log)
   */
  private updateUI(state: BoardState): void {
    if (!this.containers.ui) return;

    // Update AI portrait
    this.containers.ui.removeChild(this.aiHealthDisplay);
    this.aiHealthDisplay = this.uiRenderer.createHeroPortrait(
      state.aiHealth,
      state.aiMana,
      state.aiMaxMana,
      'AI Opponent',
      true
    );
    const aiPortraitPos = this.boardLayout.getAIPortraitPosition();
    this.aiHealthDisplay.x = aiPortraitPos.x;
    this.aiHealthDisplay.y = aiPortraitPos.y;

    // Make AI face targetable if player has selected a minion
    if (state.selectedMinion && state.currentTurn === 'player') {
      // Add red tint instead of glow
      this.aiHealthDisplay.tint = 0xff6666;
      this.aiHealthDisplay.eventMode = 'static';
      this.aiHealthDisplay.cursor = 'pointer';

      // Capture current state
      const currentlySelected = state.selectedMinion;

      this.aiHealthDisplay.on('pointerdown', () => {
        console.log('AI portrait clicked');
        this.callbacks.onAIFaceClick();
      });
    } else {
      this.aiHealthDisplay.tint = 0xffffff;
      this.aiHealthDisplay.eventMode = 'auto';
      this.aiHealthDisplay.cursor = 'default';
      this.aiHealthDisplay.removeAllListeners();
    }

    this.containers.ui.addChild(this.aiHealthDisplay);

    // Update player portrait
    this.containers.ui.removeChild(this.playerHealthDisplay);
    this.playerHealthDisplay = this.uiRenderer.createHeroPortrait(
      state.playerHealth,
      state.playerMana,
      state.playerMaxMana,
      'You',
      false
    );
    const playerPortraitPos = this.boardLayout.getPlayerPortraitPosition();
    this.playerHealthDisplay.x = playerPortraitPos.x;
    this.playerHealthDisplay.y = playerPortraitPos.y;
    this.containers.ui.addChild(this.playerHealthDisplay);

    // Update deck indicators
    // Calculate remaining cards (assuming initial deck of 30)
    const aiCardsRemaining = Math.max(0, 30 - state.aiHandCount - state.aiBoard.length);
    const playerCardsRemaining = Math.max(0, 30 - state.playerHand.length - state.playerBoard.length);

    this.containers.ui.removeChild(this.aiDeckIndicator);
    this.aiDeckIndicator = this.uiRenderer.createDeckIndicator(aiCardsRemaining, true);
    const aiDeckPos = this.boardLayout.getAIDeckPosition();
    this.aiDeckIndicator.x = aiDeckPos.x;
    this.aiDeckIndicator.y = aiDeckPos.y;
    this.containers.ui.addChild(this.aiDeckIndicator);

    this.containers.ui.removeChild(this.playerDeckIndicator);
    this.playerDeckIndicator = this.uiRenderer.createDeckIndicator(playerCardsRemaining, false);
    const playerDeckPos = this.boardLayout.getPlayerDeckPosition();
    this.playerDeckIndicator.x = playerDeckPos.x;
    this.playerDeckIndicator.y = playerDeckPos.y;
    this.containers.ui.addChild(this.playerDeckIndicator);

    // Update combat log
    this.containers.ui.removeChild(this.combatLogDisplay);
    this.combatLogDisplay = this.uiRenderer.createCombatLog(state.combatLog, state.aiAction);
    const logPos = this.boardLayout.getCombatLogPosition();
    this.combatLogDisplay.x = logPos.x;
    this.combatLogDisplay.y = logPos.y;
    this.combatLogDisplay.alpha = 0.8;
    this.containers.ui.addChild(this.combatLogDisplay);

    // Update turn indicator
    this.containers.ui.removeChild(this.turnIndicator);
    this.turnIndicator = this.uiRenderer.createTurnIndicator(state.turnNumber, state.currentTurn);
    const turnPos = this.boardLayout.getTurnIndicatorPosition();
    this.turnIndicator.x = turnPos.x;
    this.turnIndicator.y = turnPos.y;
    this.containers.ui.addChild(this.turnIndicator);

    // Update end turn button
    this.containers.ui.removeChild(this.endTurnButton);
    this.endTurnButton = this.uiRenderer.createEndTurnButton(
      state.currentTurn === 'player' && !state.gameOver
    );
    const buttonPos = this.boardLayout.getEndTurnButtonPosition();
    this.endTurnButton.x = buttonPos.x;
    this.endTurnButton.y = buttonPos.y;

    if (state.currentTurn === 'player' && !state.gameOver) {
      this.endTurnButton.on('pointerdown', () => this.callbacks.onEndTurn());
    }

    this.containers.ui.addChild(this.endTurnButton);
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    if (!this.app) return;

    // Resize renderer
    this.app.renderer.resize(window.innerWidth, window.innerHeight);

    // Update layout dimensions
    this.boardLayout.updateDimensions(this.app.screen.width, this.app.screen.height);

    // Recreate background with new dimensions
    this.containers.background?.removeChildren();
    this.renderBackground();

    // Reposition UI elements
    const aiPortraitPos = this.boardLayout.getAIPortraitPosition();
    this.aiHealthDisplay.x = aiPortraitPos.x;
    this.aiHealthDisplay.y = aiPortraitPos.y;

    const playerPortraitPos = this.boardLayout.getPlayerPortraitPosition();
    this.playerHealthDisplay.x = playerPortraitPos.x;
    this.playerHealthDisplay.y = playerPortraitPos.y;

    const aiDeckPos = this.boardLayout.getAIDeckPosition();
    this.aiDeckIndicator.x = aiDeckPos.x;
    this.aiDeckIndicator.y = aiDeckPos.y;

    const playerDeckPos = this.boardLayout.getPlayerDeckPosition();
    this.playerDeckIndicator.x = playerDeckPos.x;
    this.playerDeckIndicator.y = playerDeckPos.y;

    const logPos = this.boardLayout.getCombatLogPosition();
    this.combatLogDisplay.x = logPos.x;
    this.combatLogDisplay.y = logPos.y;

    const turnPos = this.boardLayout.getTurnIndicatorPosition();
    this.turnIndicator.x = turnPos.x;
    this.turnIndicator.y = turnPos.y;

    const buttonPos = this.boardLayout.getEndTurnButtonPosition();
    this.endTurnButton.x = buttonPos.x;
    this.endTurnButton.y = buttonPos.y;
  }

  /**
   * Destroy the PixiJS application
   */
  destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));

    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
      this.app = null;
    }
  }
}