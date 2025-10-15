import { BattleState, Card, Player } from '../types/game';
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
      return processSummonAbility(ability, state, currentPlayer);
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
  player.hand = [...player.hand, ...drawn.drawn];
  player.deck = drawn.remaining;
  return state;
}

function processHealAbility(ability: any, state: BattleState, player: Player): BattleState {
  if (ability.target === 'self') {
    player.health = Math.min(player.health + (ability.value || 0), 30);
  }
  return state;
}

function processDamageAbility(ability: any, state: BattleState, currentPlayer: Player, opponent: Player): BattleState {
  const damageValue = ability.value || 0;

  if (ability.target === 'enemy') {
    opponent.health -= damageValue;
  } else if (ability.target === 'all') {
    // Damage all enemy minions
    opponent.board = opponent.board.map(m => ({
      ...m,
      currentHealth: m.currentHealth - damageValue
    })).filter(m => m.currentHealth > 0);

    // Special case: cards like Balor that damage everything
    if (ability.description?.includes('everything')) {
      opponent.health -= damageValue;
      currentPlayer.health -= damageValue;

      // Damage friendly minions too
      currentPlayer.board = currentPlayer.board.map(m => ({
        ...m,
        currentHealth: m.currentHealth - damageValue
      })).filter(m => m.currentHealth > 0);
    }
  } else if (ability.target === 'random') {
    // Damage random enemy minion
    if (opponent.board.length > 0) {
      const randomIndex = Math.floor(Math.random() * opponent.board.length);
      opponent.board[randomIndex] = {
        ...opponent.board[randomIndex],
        currentHealth: opponent.board[randomIndex].currentHealth - damageValue
      };
      opponent.board = opponent.board.filter(m => m.currentHealth > 0);
    }
  }

  return state;
}

function processSummonAbility(ability: any, state: BattleState, player: Player): BattleState {
  // Basic implementation - would need card definitions for specific summons
  // For now, just placeholder
  return state;
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

export function processDeathrattles(minions: any[], state: BattleState, isPlayer: boolean): BattleState {
  let newState = { ...state };
  
  minions.forEach(minion => {
    if (minion.abilities) {
      newState = processAbilities(minion, 'deathrattle', newState, isPlayer);
    }
  });

  return newState;
}

export function processEndOfTurnEffects(minions: any[], state: BattleState, isPlayer: boolean): BattleState {
  let newState = { ...state };
  
  minions.forEach(minion => {
    newState = processAbilities(minion, 'end_of_turn', newState, isPlayer);
  });

  return newState;
}