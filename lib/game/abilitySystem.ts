import { BattleState, Card, Player } from '../types/game';
import { createMinion } from './gameLogic';
import { drawCards } from './deckManager';

export function processAbilities(
  card: Card,
  trigger: 'battlecry' | 'deathrattle' | 'end_of_turn',
  state: BattleState,
  isPlayer: boolean
): BattleState {
  if (!card.abilities) return state;

  const relevantAbilities = card.abilities.filter(a => a.trigger === trigger);
  let newState = { ...state };

  relevantAbilities.forEach(ability => {
    newState = processAbility(ability, newState, isPlayer);
  });

  return newState;
}

function processAbility(ability: any, state: BattleState, isPlayer: boolean): BattleState {
  const currentPlayer = isPlayer ? state.player : state.ai;
  const opponent = isPlayer ? state.ai : state.player;

  switch (ability.type) {
    case 'draw':
      return processDrawAbility(ability, state, currentPlayer);
    case 'heal':
      return processHealAbility(ability, state, currentPlayer);
    case 'damage':
      return processDamageAbility(ability, state, currentPlayer, opponent);
    case 'summon':
      return processSummonAbility(ability, state, currentPlayer, isPlayer);
    case 'buff':
      return processBuffAbility(ability, state, currentPlayer);
    case 'destroy':
      return processDestroyAbility(ability, state, opponent);
    default:
      return state;
  }
}

function processDrawAbility(ability: any, state: BattleState, player: Player): BattleState {
  const drawn = drawCards(player.deck, ability.value || 1);
  return {
    ...state,
    player: player === state.player ? {
      ...player,
      hand: [...player.hand, ...drawn.drawn],
      deck: drawn.remaining
    } : state.player,
    ai: player === state.ai ? {
      ...player,
      hand: [...player.hand, ...drawn.drawn],
      deck: drawn.remaining
    } : state.ai
  };
}

function processHealAbility(ability: any, state: BattleState, player: Player): BattleState {
  if (ability.target === 'self') {
    return {
      ...state,
      player: player === state.player ? {
        ...player,
        health: Math.min(player.health + (ability.value || 0), 30)
      } : state.player,
      ai: player === state.ai ? {
        ...player,
        health: Math.min(player.health + (ability.value || 0), 30)
      } : state.ai
    };
  }
  return state;
}

function processDamageAbility(ability: any, state: BattleState, currentPlayer: Player, opponent: Player): BattleState {
  const damageValue = ability.value || 0;
  let newState = { ...state };

  if (ability.target === 'enemy') {
    // Direct damage to enemy hero
    newState = {
      ...newState,
      player: opponent === state.player ? {
        ...opponent,
        health: opponent.health - damageValue
      } : state.player,
      ai: opponent === state.ai ? {
        ...opponent,
        health: opponent.health - damageValue
      } : state.ai
    };
  } else if (ability.target === 'all') {
    // Damage all enemy minions
    const updatedOpponentBoard = opponent.board.map(m => ({
      ...m,
      currentHealth: m.currentHealth - damageValue
    })).filter(m => m.currentHealth > 0);

    // Special case: cards like Balor that damage everything
    if (ability.description?.includes('everything')) {
      // Damage both heroes
      const updatedCurrentPlayer = {
        ...currentPlayer,
        health: currentPlayer.health - damageValue,
        board: currentPlayer.board.map(m => ({
          ...m,
          currentHealth: m.currentHealth - damageValue
        })).filter(m => m.currentHealth > 0)
      };

      const updatedOpponent = {
        ...opponent,
        health: opponent.health - damageValue,
        board: updatedOpponentBoard
      };

      newState = {
        ...newState,
        player: currentPlayer === state.player ? updatedCurrentPlayer : updatedOpponent,
        ai: currentPlayer === state.ai ? updatedCurrentPlayer : updatedOpponent
      };
    } else {
      // Only damage enemy board
      newState = {
        ...newState,
        player: opponent === state.player ? {
          ...opponent,
          board: updatedOpponentBoard
        } : state.player,
        ai: opponent === state.ai ? {
          ...opponent,
          board: updatedOpponentBoard
        } : state.ai
      };
    }
  } else if (ability.target === 'random') {
    // Damage random enemy minion
    if (opponent.board.length > 0) {
      const randomIndex = Math.floor(Math.random() * opponent.board.length);
      const updatedBoard = [...opponent.board];
      updatedBoard[randomIndex] = {
        ...updatedBoard[randomIndex],
        currentHealth: updatedBoard[randomIndex].currentHealth - damageValue
      };

      newState = {
        ...newState,
        player: opponent === state.player ? {
          ...opponent,
          board: updatedBoard.filter(m => m.currentHealth > 0)
        } : state.player,
        ai: opponent === state.ai ? {
          ...opponent,
          board: updatedBoard.filter(m => m.currentHealth > 0)
        } : state.ai
      };
    }
  }

  return newState;
}

function processSummonAbility(
  ability: any,
  state: BattleState,
  player: Player,
  isPlayer: boolean
): BattleState {
  if (player.board.length >= 7) {
    return state; // Board full
  }

  // choose what cards need to be summoned
  let summonedCards: Card[] = [];

  if (ability.decription?.includes('Connacht Warriors')) {
    const warriorCard: Card = {
      id: 'token_warrior',
      name: 'Connacht Warrior',
      element: 'fire',
      type: 'minion',
      rarity: 'common',
      manaCost: 1,
      attack: 2,
      health: 2,
      description: 'Token minion summoned by Queen Maedhbh.'
    };

    for (let i = 0; i < ability.value; i++) {
      summonedCards.push({ ...warriorCard });
    }
  }

  const newMinions = summonedCards.map(card => createMinion(card));
  const newBoard = [...player.board];

  for (const minion of newMinions) {
    if (newBoard.length < 7) {
      newBoard.push(minion);
    }
  }

  return {
    ...state,
    player: isPlayer ? { ...player, board: newBoard } : state.player,
    ai: !isPlayer ? { ...player, board: newBoard } : state.ai,
  };
}

function processBuffAbility(ability: any, state: BattleState, player: Player): BattleState {
  if (ability.target === 'all') {
    // Buff all friendly minions
    player.board = player.board.map(m => ({
      ...m,
      attack: m.attack + (ability.value || 1),
      health: m.health + (ability.value || 1),
      currentHealth: m.currentHealth + (ability.value || 1)
    }));
  }
  return state;
}

function processDestroyAbility(ability: any, state: BattleState, opponent: Player): BattleState {
  // Basic destroy - remove random enemy minion
  if (opponent.board.length > 0) {
    const randomIndex = Math.floor(Math.random() * opponent.board.length);
    opponent.board.splice(randomIndex, 1);
  }
  return state;
}

export function processEndOfTurnEffects(minions: any[], state: BattleState, isPlayer: boolean): BattleState {
  let newState = { ...state };

  minions.forEach(minion => {
    newState = processAbilities(minion, 'end_of_turn', newState, isPlayer);
  });

  return newState;
}