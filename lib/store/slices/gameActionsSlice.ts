/**
 * Game Actions Slice
 * 
 * Purpose:
 * Handles all player-initiated actions during their turn including playing cards,
 * attacking with minions, and attacking the enemy hero. Coordinates game logic
 * functions with state updates.
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
  handleHeroAttack,
  boardHasTaunt,
  hasTaunt,
  isValidAttackTarget,
} from '../../game/gameLogic';
import { removeCardFromHand } from '../../game/deckManager';
import { processAbilities } from '../../game/abilitySystem';
import { BattleSlice } from './battleSlice';

export interface GameActionsSlice {
  playCard: (cardIndex: number, targetId?: string) => void;
  attack: (attackerId: string, targetId: string) => void;
  attackHero: (attackerId: string) => void;
}

// Game Actions Slice Creator; defines player actions during their turn
export const createGameActionsSlice: StateCreator<
  GameActionsSlice & BattleSlice,
  [],
  [],
  GameActionsSlice
  // takes set and get from zustand for state management
> = (set, get) => ({

  // Update state when player plays a card
  playCard: (cardIndex, targetId) => {

    // get the current state of the game and check it hasn't ended
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    // validate the card can be played by checking mana cost
    const card = state.player.hand[cardIndex];
    if (!card || card.manaCost > state.player.mana) return;

    // need to create a new state which will be checked against the global state of the game/board
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

    // remove the valid card from hand and deduct mana
    newState.player = {
      ...newState.player,
      hand: removeCardFromHand(newState.player.hand, cardIndex),
      mana: newState.player.mana - card.manaCost,
    };

    // handle minion or spell card play
    if (card.type === 'minion')
    {
      newState.player.board = [...newState.player.board, createMinion(card)];
      newState.combatLog.push(`You play ${card.name}`);
    } 
    else if (card.type === 'spell') 
    {
      newState.combatLog.push(`You cast ${card.name}`);
    }

    // process battlecry effects from minions that are played
    newState = processAbilities(card, 'battlecry', newState, true);
    
    set({ ...newState, selectedMinion: null });
  },

  // attack function takes in attacker and target IDs to process minion combat
  attack: (attackerId, targetId) => {

    // get the current state of the game and check it hasn't ended
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    // find() function uses instanceId to locate the minion that is attacking
    const attacker = state.player.board.find((m) => m.instanceId === attackerId);
    if (!attacker || !attacker.canAttack) return;

    // find() function uses instanceId to locate the target minion on enemy board
    const target = state.ai.board.find((m) => m.instanceId === targetId);
    if (!target) return;

    // validate if the target is a valid attack target considering Taunt mechanics
    if (!isValidAttackTarget(targetId, state.ai.board)) {
      const tauntMinion = state.ai.board.find((m) => hasTaunt(m));
      const tauntName = tauntMinion?.name || ' a minion with Taunt';

      set({
        ...state,
        combatLog: [
          ...state.combatLog,
          `Cannot attack ${target.name} - must attack${tauntName} first!`
        ]
      });

      return;
    }

    // update the combat log and board states immutably
    let newState: BattleState = {
      ...state,
      combatLog: [...state.combatLog]
    };

    // obtain the combat result from the game logic function
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

    // Process any deathrattle abilities for minions that died on either side of the combat
    if (combatResult.targetDied && target.abilities) {
      newState = processAbilities(target, 'deathrattle', newState, false);
    }
    if (combatResult.attackerDied && attacker.abilities) {
      newState = processAbilities(attacker, 'deathrattle', newState, true);
    }

    set({ ...newState, selectedMinion: null });
  },

  // attackHero function processes minion attacking the enemy hero directly
  attackHero: (attackerId) => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;

    const attacker = state.player.board.find((m) => m.instanceId === attackerId);
    if (!attacker || !attacker.canAttack) return;

    if (boardHasTaunt(state.ai.board)) {
      const tauntMinion = state.ai.board.find((m) => hasTaunt(m));
      const tauntName = tauntMinion?.name || ' a minion with Taunt';

      set({
        ...state,
        combatLog: [
          ...state.combatLog,
          `Cannot attack the enemy hero - must attack${tauntName} first!`
        ]
      });

      return;
    }

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