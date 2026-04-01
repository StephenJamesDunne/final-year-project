import * as PIXI from "pixi.js";
import { BoardCallbacks, BoardState } from "../PixiBoard";
import { BoardLayout } from "../layout/BoardLayout";
import { PortraitRenderer } from "./PortraitRenderer";
import { CombatLogRenderer } from "./CombatLogRenderer";
import { EndTurnButton } from "./EndTurnButton";
import { DeckIndicator } from "./DeckIndicator";
import { TurnIndicator } from "./TurnIndicator";
import { COLORS } from "../utils/StyleConstants";
import { boardHasTaunt } from "@/lib/game/gameLogic";
import { CardRenderer } from "../rendering/CardRenderer";

export class UIManager {
  private portraitRenderer: PortraitRenderer;
  private combatLogRenderer: CombatLogRenderer;
  private endTurnButton: EndTurnButton;
  private deckIndicator: DeckIndicator;
  private turnIndicator: TurnIndicator;
  private layout: BoardLayout;

  // Persistent element references: created once in createInitialUI,
  // updated in place by updateUI
  private aiPortrait!: ReturnType<PortraitRenderer["createHeroPortrait"]>;
  private playerPortrait!: ReturnType<PortraitRenderer["createHeroPortrait"]>;
  private aiDeck!: ReturnType<DeckIndicator["createIndicator"]>;
  private playerDeck!: ReturnType<DeckIndicator["createIndicator"]>;
  private combatLog!: ReturnType<CombatLogRenderer["createCombatLog"]>;
  private turnIndicatorDisplay!: ReturnType<TurnIndicator["createIndicator"]>;
  private endTurnButtonDisplay!: ReturnType<EndTurnButton["createButton"]>;

  constructor(layout: BoardLayout, cardRenderer: CardRenderer) {
    this.layout = layout;
    this.portraitRenderer = new PortraitRenderer();
    this.combatLogRenderer = new CombatLogRenderer();
    this.endTurnButton = new EndTurnButton();
    this.deckIndicator = new DeckIndicator(cardRenderer);
    this.turnIndicator = new TurnIndicator();
  }

  // Called only once on init. Creates all elements and adds them to the container
  createInitialUI(container: PIXI.Container, callbacks: BoardCallbacks): void {
    // Create all UI elements
    this.aiPortrait = this.portraitRenderer.createHeroPortrait(30, 1, 1, true);
    this.playerPortrait = this.portraitRenderer.createHeroPortrait(
      30,
      1,
      1,
      false,
    );
    this.aiDeck = this.deckIndicator.createIndicator(30, true);
    this.playerDeck = this.deckIndicator.createIndicator(30, false);
    this.combatLog = this.combatLogRenderer.createCombatLog([]);
    this.turnIndicatorDisplay = this.turnIndicator.createIndicator(1, "player");
    this.endTurnButtonDisplay = this.endTurnButton.createButton(
      true,
      callbacks.onEndTurn,
    );

    // Position everything
    this.positionElements();

    // Add to container
    container.addChild(this.aiPortrait);
    container.addChild(this.playerPortrait);
    container.addChild(this.aiDeck);
    container.addChild(this.playerDeck);
    container.addChild(this.combatLog);
    container.addChild(this.turnIndicatorDisplay);
    container.addChild(this.endTurnButtonDisplay);
  }

  updateUI(
    container: PIXI.Container,
    state: BoardState,
    callbacks: BoardCallbacks,
    prev: BoardState | null,
  ): void {
    // Portraits - update health and mana values
    if (
      !prev ||
      prev.aiHealth !== state.aiHealth ||
      prev.aiMana !== state.aiMana ||
      prev.aiMaxMana !== state.aiMaxMana
    ) {
      this.aiPortrait.updateHealth(state.aiHealth);
      this.aiPortrait.updateMana(state.aiMana, state.aiMaxMana);
    }

    if (
      !prev ||
      prev.playerHealth !== state.playerHealth ||
      prev.playerMana !== state.playerMana ||
      prev.playerMaxMana !== state.playerMaxMana
    ) {
      this.playerPortrait.updateHealth(state.playerHealth);
      this.playerPortrait.updateMana(state.playerMana, state.playerMaxMana);
    }

    if (
      !prev ||
      prev.selectedMinion !== state.selectedMinion ||
      prev.currentTurn !== state.currentTurn ||
      prev.aiBoard !== state.aiBoard
    ) {
      this.aiPortrait.removeAllListeners();
      this.aiPortrait.eventMode = "none";
      this.aiPortrait.tint = 0xffffff;
      this.aiPortrait.alpha = 1;

      if (state.selectedMinion && state.currentTurn === "player") {
        const canTargetFace = !boardHasTaunt(state.aiBoard);
        if (canTargetFace) {
          this.aiPortrait.tint = COLORS.UI.aiTint2;
          this.aiPortrait.eventMode = "static";
          this.aiPortrait.cursor = "pointer";
          this.aiPortrait.on("pointerdown", callbacks.onAIFaceClick);
        } else {
          this.aiPortrait.alpha = 0.5;
        }
      }
    }

    // Deck counts
    if (!prev || prev.aiDeckCount !== state.aiDeckCount) {
      this.aiDeck.updateCount(state.aiDeckCount);
    }

    if (!prev || prev.playerDeckCount !== state.playerDeckCount) {
      this.playerDeck.updateCount(state.playerDeckCount);
    }

    // Combat log
    if (!prev || prev.combatLog !== state.combatLog) {
      this.combatLog.updateLog(state.combatLog);
    }

    // Turn indicator
    if (
      !prev ||
      prev.turnNumber !== state.turnNumber ||
      prev.currentTurn !== state.currentTurn
    ) {
      this.turnIndicatorDisplay.updateTurn(state.turnNumber, state.currentTurn);
    }

    // End turn button - only changes when turn or game over changes
    if (
      !prev ||
      prev.currentTurn !== state.currentTurn ||
      prev.gameOver !== state.gameOver
    ) {
      const enabled = state.currentTurn === "player" && !state.gameOver;
      this.endTurnButtonDisplay.updateEnabled(enabled, callbacks.onEndTurn);
    }
  }

  repositionOnResize(): void {
    this.positionElements();
  }

  private positionElements(): void {
    const aiPortraitPos = this.layout.getAIPortraitPosition();
    this.aiPortrait.x = aiPortraitPos.x;
    this.aiPortrait.y = aiPortraitPos.y;

    const playerPortraitPos = this.layout.getPlayerPortraitPosition();
    this.playerPortrait.x = playerPortraitPos.x;
    this.playerPortrait.y = playerPortraitPos.y;

    const aiDeckPos = this.layout.getAIDeckPosition();
    this.aiDeck.x = aiDeckPos.x;
    this.aiDeck.y = aiDeckPos.y;

    const playerDeckPos = this.layout.getPlayerDeckPosition();
    this.playerDeck.x = playerDeckPos.x;
    this.playerDeck.y = playerDeckPos.y;

    const logPos = this.layout.getCombatLogPosition();
    this.combatLog.x = logPos.x;
    this.combatLog.y = logPos.y;
    this.combatLog.alpha = 0.8;

    const turnPos = this.layout.getTurnIndicatorPosition();
    this.turnIndicatorDisplay.x = turnPos.x;
    this.turnIndicatorDisplay.y = turnPos.y;

    const buttonPos = this.layout.getEndTurnButtonPosition();
    this.endTurnButtonDisplay.x = buttonPos.x;
    this.endTurnButtonDisplay.y = buttonPos.y;
  }
}
