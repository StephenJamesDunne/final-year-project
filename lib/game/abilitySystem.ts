import { BattleState, Card, CardAbility, Minion } from '../types/game';
import { drawCards } from './deckManager';

const MAX_HEALTH = 30;

// Parse played cards for any ability keywords
export function processAbilities(
  card: Card,
  trigger: 'battlecry' | 'deathrattle',
  state: BattleState,
  isPlayer: boolean
): BattleState {
  const abilities = card.abilities?.filter(a => a.trigger === trigger);

  if (!abilities || abilities.length === 0) {
    return state;
  }

  let currentState = state;

  for (const ability of abilities) {
    currentState = processAbility(ability, currentState, isPlayer);
  }

  return currentState;
}

// Parse through specific abilities based on their corresponding keywords
function processAbility(
  ability: CardAbility,
  state: BattleState,
  isPlayer: boolean
): BattleState {

  switch (ability.type) {
    case 'draw':
      return processDrawAbility(ability, state, isPlayer);
    case 'heal':
      return processHealAbility(ability, state, isPlayer);
    case 'damage':
      return processDamageAbility(ability, state, isPlayer);
    case 'buff':
      return processBuffAbility(ability, state, isPlayer);
    default:
      console.warn('Ability not processed');
      return state;
  }
}

function processDrawAbility(
  ability: CardAbility,
  state: BattleState,
  isPlayer: boolean): BattleState {

  const cardsToDraw = ability.value ?? 1;
  const player = isPlayer ? state.player : state.ai;

  const { drawn, remaining } = drawCards(player.deck, cardsToDraw);

  if (isPlayer) {
    return {
      ...state,
      player: {
        ...state.player,
        hand: [...state.player.hand, ...drawn],
        deck: remaining,
      },
    };
  } else {
    return {
      ...state,
      ai: {
        ...state.ai,
        hand: [...state.ai.hand, ...drawn],
        deck: remaining,
      },
    };
  }
}

function processHealAbility(
  ability: CardAbility,
  state: BattleState,
  isPlayer: boolean
): BattleState {
  const healing = ability.value ?? 0;

  switch (ability.target) {
    case 'self':
      return healHero(state, isPlayer, healing);
    case 'enemy':
      return healHero(state, !isPlayer, healing);
    default:
      return state;
  }
}

function processDamageAbility(
  ability: CardAbility,
  state: BattleState,
  isPlayer: boolean
): BattleState {
  const damage = ability.value ?? 0;

  switch (ability.target) {
    case 'self':
      return damageHero(state, isPlayer, damage);
    case 'enemy':
      return damageHero(state, !isPlayer, damage);
    case 'random':
      return damageRandomMinion(state, isPlayer, damage);
    case 'all':
      return damageAllMinions(state, isPlayer, damage);
    default:
      return state;
  }
}

function processBuffAbility(ability: CardAbility, state: BattleState, isPlayer: boolean): BattleState {
  if (ability.target !== 'all') return state;

  const targetPlayer = isPlayer ? state.player : state.ai;

  const updatedBoard = targetPlayer.board.map(m => ({
    ...m,
    attack: m.attack + (ability.value || 1),
    health: m.health + (ability.value || 1),
    currentHealth: m.currentHealth + (ability.value || 1)
  }));

  const updatedPlayer = {
    ...targetPlayer,
    board: updatedBoard
  };

  return {
    ...state,
    player: isPlayer ? updatedPlayer : state.player,
    ai: isPlayer ? state.ai : updatedPlayer
  }
}

/// Helper functions for ability parsing
function healHero(
  state: BattleState,
  targetIsPlayer: boolean,
  healing: number
): BattleState {
  if (targetIsPlayer) {
    return {
      ...state,
      player: {
        ...state.player,
        health: Math.min(state.player.health + healing, MAX_HEALTH),
      },
    };
  } else {
    return {
      ...state,
      ai: {
        ...state.ai,
        health: Math.min(state.ai.health + healing, MAX_HEALTH),
      },
    };
  }
}

function damageHero(
  state: BattleState,
  targetIsPlayer: boolean,
  damage: number
): BattleState {
  if (targetIsPlayer) {
    return {
      ...state,
      player: {
        ...state.player,
        health: state.player.health - damage,
      },
    };
  } else {
    return {
      ...state,
      ai: {
        ...state.ai,
        health: state.ai.health - damage,
      },
    };
  }
}

function damageMinion(
  board: Minion[],
  targetIndex: number,
  damage: number
): Minion[] {
  const updatedBoard: Minion[] = [];

  for (let i = 0; i < board.length; i++) {
    const minion = board[i];

    if (i !== targetIndex) {
      updatedBoard.push(minion);
      continue;
    }

    const newHealth = minion.currentHealth - damage;

    if (newHealth > 0) {
      updatedBoard.push({
        ...minion,
        currentHealth: newHealth,
      });
    }
  }

  return updatedBoard;
}

function damageRandomMinion(
  state: BattleState,
  isPlayer: boolean,
  damage: number
): BattleState {
  const enemyBoard = isPlayer ? state.ai.board : state.player.board;

  if (enemyBoard.length === 0) {
    return state;
  }

  const randomIndex = Math.floor(Math.random() * enemyBoard.length);
  const updatedBoard = damageMinion(enemyBoard, randomIndex, damage);

  if (isPlayer) {
    return {
      ...state,
      ai: { ...state.ai, board: updatedBoard },
    };
  } else {
    return {
      ...state,
      player: { ...state.player, board: updatedBoard },
    };
  }
}

function damageAllMinions(
  state: BattleState,
  isPlayer: boolean,
  damage: number
): BattleState {
  const enemyBoard = isPlayer ? state.ai.board : state.player.board;

  const updatedBoard: Minion[] = [];

  for (const minion of enemyBoard) {
    const newHealth = minion.currentHealth - damage;

    if (newHealth > 0) {
      updatedBoard.push({
        ...minion,
        currentHealth: newHealth,
      });
    }
  }

  if (isPlayer) {
    return {
      ...state,
      ai: { ...state.ai, board: updatedBoard },
    };
  } else {
    return {
      ...state,
      player: { ...state.player, board: updatedBoard },
    };
  }
}