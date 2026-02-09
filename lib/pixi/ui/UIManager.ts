import * as PIXI from 'pixi.js';
import { BoardState, BoardCallbacks } from '../PixiBoard';
import { BoardLayout } from '../layout/BoardLayout';
import { PortraitRenderer } from './PortraitRenderer';
import { CombatLogRenderer } from './CombatLogRenderer';
import { EndTurnButton } from './EndTurnButton';
import { DeckIndicator } from './DeckIndicator';
import { TurnIndicator } from './TurnIndicator';
import { COLORS } from '../utils/StyleConstants';
import { boardHasTaunt } from '@/lib/game/gameLogic';

export class UIManager {
  private portraitRenderer: PortraitRenderer;
  private combatLogRenderer: CombatLogRenderer;
  private endTurnButton: EndTurnButton;
  private deckIndicator: DeckIndicator;
  private turnIndicator: TurnIndicator;
  private layout: BoardLayout;

  // UI element references
  private aiHealthDisplay!: PIXI.Container;
  private playerHealthDisplay!: PIXI.Container;
  private aiDeckIndicator!: PIXI.Container;
  private playerDeckIndicator!: PIXI.Container;
  private combatLogDisplay!: PIXI.Container;
  private turnIndicatorDisplay!: PIXI.Container;
  private endTurnButtonDisplay!: PIXI.Container;

  constructor(layout: BoardLayout) {
    this.layout = layout;
    this.portraitRenderer = new PortraitRenderer();
    this.combatLogRenderer = new CombatLogRenderer();
    this.endTurnButton = new EndTurnButton();
    this.deckIndicator = new DeckIndicator();
    this.turnIndicator = new TurnIndicator();
  }

  createInitialUI(container: PIXI.Container, callbacks: BoardCallbacks): void {
    // Create all UI elements
    this.aiHealthDisplay = this.portraitRenderer.createHeroPortrait(30, 1, 1, true);
    this.playerHealthDisplay = this.portraitRenderer.createHeroPortrait(30, 1, 1, false);
    this.aiDeckIndicator = this.deckIndicator.createIndicator(30, true);
    this.playerDeckIndicator = this.deckIndicator.createIndicator(30, false);
    this.combatLogDisplay = this.combatLogRenderer.createCombatLog([]);
    this.turnIndicatorDisplay = this.turnIndicator.createIndicator(1, 'player');
    this.endTurnButtonDisplay = this.endTurnButton.createButton(true, callbacks.onEndTurn);

    // Position everything
    this.positionElements();

    // Add to container
    container.addChild(this.aiHealthDisplay);
    container.addChild(this.playerHealthDisplay);
    container.addChild(this.aiDeckIndicator);
    container.addChild(this.playerDeckIndicator);
    container.addChild(this.combatLogDisplay);
    container.addChild(this.turnIndicatorDisplay);
    container.addChild(this.endTurnButtonDisplay);
  }

  updateUI(container: PIXI.Container, state: BoardState, callbacks: BoardCallbacks): void {
    this.destroyOldElements();

    // Remove old elements
    this.removeElements(container);

    // Recreate with new state
    this.aiHealthDisplay = this.portraitRenderer.createHeroPortrait(
      state.aiHealth,
      state.aiMana,
      state.aiMaxMana,
      true
    );

    // Make AI targetable if needed
    if (state.selectedMinion && state.currentTurn === 'player') {
      const canTargetFace = !boardHasTaunt(state.aiBoard);

      if (canTargetFace) {
        this.aiHealthDisplay.tint = COLORS.UI.aiTint2;
        this.aiHealthDisplay.eventMode = 'static';
        this.aiHealthDisplay.cursor = 'pointer';
        this.aiHealthDisplay.on('pointerdown', callbacks.onAIFaceClick);
      } else {
        // Dim the portrait to show it can't be targeted
        this.aiHealthDisplay.alpha = 0.5;
      }
    }

    this.playerHealthDisplay = this.portraitRenderer.createHeroPortrait(
      state.playerHealth,
      state.playerMana,
      state.playerMaxMana,
      false
    );

    const aiCardsRemaining = Math.max(0, 30 - state.aiHandCount - state.aiBoard.length);
    const playerCardsRemaining = Math.max(
      0,
      30 - state.playerHand.length - state.playerBoard.length
    );

    this.aiDeckIndicator = this.deckIndicator.createIndicator(aiCardsRemaining, true);
    this.playerDeckIndicator = this.deckIndicator.createIndicator(playerCardsRemaining, false);
    this.combatLogDisplay = this.combatLogRenderer.createCombatLog(
      state.combatLog
    );
    this.turnIndicatorDisplay = this.turnIndicator.createIndicator(
      state.turnNumber,
      state.currentTurn
    );
    this.endTurnButtonDisplay = this.endTurnButton.createButton(
      state.currentTurn === 'player' && !state.gameOver,
      callbacks.onEndTurn
    );

    // Position and add to container
    this.positionElements();
    this.addElements(container);
  }

  private destroyOldElements(): void {
    // Destroy each element if it exists
    // children: true destroys nested elements
    this.aiHealthDisplay?.destroy({children: true});
    this.playerHealthDisplay?.destroy({ children: true });
    this.aiDeckIndicator?.destroy({ children: true });
    this.playerDeckIndicator?.destroy({ children: true });
    this.combatLogDisplay?.destroy({ children: true });
    this.turnIndicatorDisplay?.destroy({ children: true });
    this.endTurnButtonDisplay?.destroy({ children: true });
  }

  private positionElements(): void {
    const aiPortraitPos = this.layout.getAIPortraitPosition();
    this.aiHealthDisplay.x = aiPortraitPos.x;
    this.aiHealthDisplay.y = aiPortraitPos.y;

    const playerPortraitPos = this.layout.getPlayerPortraitPosition();
    this.playerHealthDisplay.x = playerPortraitPos.x;
    this.playerHealthDisplay.y = playerPortraitPos.y;

    const aiDeckPos = this.layout.getAIDeckPosition();
    this.aiDeckIndicator.x = aiDeckPos.x;
    this.aiDeckIndicator.y = aiDeckPos.y;

    const playerDeckPos = this.layout.getPlayerDeckPosition();
    this.playerDeckIndicator.x = playerDeckPos.x;
    this.playerDeckIndicator.y = playerDeckPos.y;

    const logPos = this.layout.getCombatLogPosition();
    this.combatLogDisplay.x = logPos.x;
    this.combatLogDisplay.y = logPos.y;
    this.combatLogDisplay.alpha = 0.8;

    const turnPos = this.layout.getTurnIndicatorPosition();
    this.turnIndicatorDisplay.x = turnPos.x;
    this.turnIndicatorDisplay.y = turnPos.y;

    const buttonPos = this.layout.getEndTurnButtonPosition();
    this.endTurnButtonDisplay.x = buttonPos.x;
    this.endTurnButtonDisplay.y = buttonPos.y;
  }

  private removeElements(container: PIXI.Container): void {
    container.removeChild(this.aiHealthDisplay);
    container.removeChild(this.playerHealthDisplay);
    container.removeChild(this.aiDeckIndicator);
    container.removeChild(this.playerDeckIndicator);
    container.removeChild(this.combatLogDisplay);
    container.removeChild(this.turnIndicatorDisplay);
    container.removeChild(this.endTurnButtonDisplay);
  }

  private addElements(container: PIXI.Container): void {
    container.addChild(this.aiHealthDisplay);
    container.addChild(this.playerHealthDisplay);
    container.addChild(this.aiDeckIndicator);
    container.addChild(this.playerDeckIndicator);
    container.addChild(this.combatLogDisplay);
    container.addChild(this.turnIndicatorDisplay);
    container.addChild(this.endTurnButtonDisplay);
  }

  repositionOnResize(): void {
    this.positionElements();
  }
}