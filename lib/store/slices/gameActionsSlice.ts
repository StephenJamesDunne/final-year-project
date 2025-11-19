/**
 * Game Actions Slice
 * 
 * Purpose:
 * Handles all player-initiated actions during their turn including playing cards,
 * attacking with minions, and attacking the enemy hero. Coordinates game logic
 * functions with state updates.
 * 
 * Actions:
 * - playCard(cardIndex, targetId?): Play a card from hand
 * - attack(attackerId, targetId): Attack enemy minion with your minion
 * - attackHero(attackerId): Attack enemy hero directly
 * 
 * Validation:
 * All actions validate:
 * - Current turn is 'player'
 * - Game is not over
 * - Action-specific requirements (mana cost, can attack, etc.)
 * 
 * Action Flow (playCard):
 * 1. Validate turn, game status, mana cost, and board space
 * 2. Remove card from hand
 * 3. Deduct mana cost
 * 4. If minion: Create minion and add to board with canAttack=false
 * 5. If spell: Execute spell effect (future implementation)
 * 6. Process battlecry abilities
 * 7. Update combat log
 * 8. Clear selected minion
 * 9. Update state with set()
 * 
 * Action Flow (attack):
 * 1. Validate attacker exists and can attack
 * 2. Validate target exists on enemy board
 * 3. Resolve combat using handleMinionCombat()
 * 4. Update both boards (remove dead minions)
 * 5. Process deathrattle abilities for casualties
 * 6. Update combat log
 * 7. Clear selected minion
 * 8. Update state with set()
 * 
 * Action Flow (attackHero):
 * 1. Validate attacker exists and can attack
 * 2. Deal damage to enemy hero
 * 3. Set attacker canAttack=false
 * 4. Check for game over
 * 5. Update combat log
 * 6. Clear selected minion
 * 7. Update state with set()
 * 
 * State Update Pattern:
 * All actions follow immutable update pattern:
 * - Create new BattleState object
 * - Build up changes locally
 * - Call set() once at the end with complete new state
 * 
 * Dependencies:
 * - gameLogic.ts: Pure functions for combat resolution
 * - abilitySystem.ts: Process card abilities (battlecry, deathrattle)
 * - deckManager.ts: Hand manipulation utilities
 * 
 * Usage Example:
 * const playCard = useBattleStore(state => state.playCard);
 * const attack = useBattleStore(state => state.attack);
 * 
 * playCard(2);  // Play card at index 2
 * attack('attacker-id', 'target-id');  // Attack enemy minion
 * 
 * @see lib/game/gameLogic.ts - Combat resolution functions
 * @see lib/game/abilitySystem.ts - Ability processing
 * @see battleSlice.ts - Core state structure
 */

import { StateCreator } from 'zustand';
import { BattleState } from '../../types/game';
import { 
  createMinion, 
  checkGameOver, 
  updateBoardAfterCombat, 
  handleMinionCombat, 
  handleHeroAttack 
} from '../../game/gameLogic';
import { removeCardFromHand } from '../../game/deckManager';
import { processAbilities } from '../../game/abilitySystem';
import { BattleSlice } from './battleSlice';

export interface GameActionsSlice {
  playCard: (cardIndex: number, targetId?: string) => void;
  attack: (attackerId: string, targetId: string) => void;
  attackHero: (attackerId: string) => void;
}

export const createGameActionsSlice: StateCreator<
  GameActionsSlice & BattleSlice,
  [],
  [],
  GameActionsSlice
> = (set, get) => ({
  playCard: (cardIndex, targetId) => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    const card = state.player.hand[cardIndex];
    if (!card || card.manaCost > state.player.mana) return;

    let newState: BattleState = {
      player: { ...state.player },
      ai: { ...state.ai },
      currentTurn: state.currentTurn,
      turnNumber: state.turnNumber,
      gameOver: state.gameOver,
      winner: state.winner,
      combatLog: [...state.combatLog],
      aiAction: state.aiAction,
    };

    newState.player = {
      ...newState.player,
      hand: removeCardFromHand(newState.player.hand, cardIndex),
      mana: newState.player.mana - card.manaCost,
    };

    if (card.type === 'minion') {
      newState.player.board = [...newState.player.board, createMinion(card)];
      newState.combatLog.push(`You play ${card.name}`);
    } else if (card.type === 'spell') {
      newState.combatLog.push(`You cast ${card.name}`);
    }

    newState = processAbilities(card, 'battlecry', newState, true);
    
    set({ ...newState, selectedMinion: null });
  },

  attack: (attackerId, targetId) => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    const attacker = state.player.board.find((m) => m.instanceId === attackerId);
    if (!attacker || !attacker.canAttack) return;

    const target = state.ai.board.find((m) => m.instanceId === targetId);
    if (!target) return;

    let newState: BattleState = {
      ...state,
      combatLog: [...state.combatLog]
    };

    const combatResult = handleMinionCombat(attacker, target);

    newState.player.board = updateBoardAfterCombat(
      newState.player.board,
      attackerId,
      combatResult.updatedAttacker
    );

    newState.ai.board = updateBoardAfterCombat(
      newState.ai.board,
      targetId,
      combatResult.updatedTarget
    );

    newState.combatLog.push(
      `${attacker.name} (${attacker.attack}/${attacker.health}) attacks ${target.name} (${target.attack}/${target.health})`
    );
    
    if (combatResult.attackerDied) {
      newState.combatLog.push(`${attacker.name} dies!`);
    }
    if (combatResult.targetDied) {
      newState.combatLog.push(`${target.name} dies!`);
    }

    if (combatResult.targetDied && target.abilities) {
      newState = processAbilities(target, 'deathrattle', newState, false);
    }
    if (combatResult.attackerDied && attacker.abilities) {
      newState = processAbilities(attacker, 'deathrattle', newState, true);
    }

    set({ ...newState, selectedMinion: null });
  },

  attackHero: (attackerId) => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    const attacker = state.player.board.find((m) => m.instanceId === attackerId);
    if (!attacker || !attacker.canAttack) return;

    let newState: BattleState = {
      ...state,
      combatLog: [...state.combatLog]
    };

    const heroAttack = handleHeroAttack(attacker, newState.ai.health);
    newState.ai.health -= heroAttack.damage;
    newState.player.board = updateBoardAfterCombat(
      newState.player.board,
      attackerId,
      heroAttack.updatedAttacker
    );

    newState.combatLog.push(
      `${attacker.name} attacks the enemy hero for ${heroAttack.damage} damage!`
    );

    const gameResult = checkGameOver(newState.player.health, newState.ai.health);
    Object.assign(newState, gameResult);

    set({ ...newState, selectedMinion: null });
  },
});