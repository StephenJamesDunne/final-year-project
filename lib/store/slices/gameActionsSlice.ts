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