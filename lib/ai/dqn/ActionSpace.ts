// ActionSpace - Map Action Indices to valid Game Moves the AI can make
// DQNModel has 68 Q-values, one per action
// ActionSpace desines each Q-value and converts it into valid moves
//
// Action Spaces:
// 0-9: Play card from hand - 10 possible cards in hand
// 10-59: Attack with a minion on the baord (7 attackers x 7 defenders)
// 60-66: Attack enemy hero (7 attackers x 1 enemy hero)
// 67: End turn
import { BattleState } from '@/lib/types/game';

// Game action types that can be executed
export interface GameAction {
  type: 'play_card' | 'attack_minion' | 'attack_face' | 'end_turn';
  cardIndex?: number;      // For play_card: which hand position
  attackerIndex?: number;  // For attack_*: which board position
  targetIndex?: number;    // For attack_minion: which enemy board position
}

// Action space constants
export const ACTION_SPACE = {
  TOTAL_ACTIONS: 68,
  
  // Action ranges
  PLAY_CARD_START: 0,
  PLAY_CARD_END: 9,
  
  ATTACK_MINION_START: 10,
  ATTACK_MINION_END: 59,
  
  ATTACK_FACE_START: 60,
  ATTACK_FACE_END: 66,
  
  END_TURN: 67,
  
  // Board/hand limits
  MAX_HAND_SIZE: 10,
  MAX_BOARD_SIZE: 7,
} as const;

// Use the given index to return a corresponding GameAction
export function decodeAction(actionIndex: number): GameAction {
  // Validate action index
  if (actionIndex < 0 || actionIndex >= ACTION_SPACE.TOTAL_ACTIONS) {
    throw new Error(`Invalid action index: ${actionIndex}. Must be 0-67.`);
  }
  
  // Play card (0-9)
  if (actionIndex >= ACTION_SPACE.PLAY_CARD_START && actionIndex <= ACTION_SPACE.PLAY_CARD_END) {
    return {
      type: 'play_card',
      cardIndex: actionIndex - ACTION_SPACE.PLAY_CARD_START,
    };
  }
  
  // Attack minion (10-59)
  if (actionIndex >= ACTION_SPACE.ATTACK_MINION_START && actionIndex <= ACTION_SPACE.ATTACK_MINION_END) {
    const offset = actionIndex - ACTION_SPACE.ATTACK_MINION_START;
    const attackerIndex = Math.floor(offset / ACTION_SPACE.MAX_BOARD_SIZE);
    const targetIndex = offset % ACTION_SPACE.MAX_BOARD_SIZE;
    
    return {
      type: 'attack_minion',
      attackerIndex,
      targetIndex,
    };
  }
  
  // Attack face (60-66)
  if (actionIndex >= ACTION_SPACE.ATTACK_FACE_START && actionIndex <= ACTION_SPACE.ATTACK_FACE_END) {
    return {
      type: 'attack_face',
      attackerIndex: actionIndex - ACTION_SPACE.ATTACK_FACE_START,
    };
  }
  
  // End turn (67)
  if (actionIndex === ACTION_SPACE.END_TURN) {
    return {
      type: 'end_turn',
    };
  }
  
  // Should never reach here due to initial validation
  throw new Error(`Failed to find action index: ${actionIndex}`);
}

// Convert the given GameAction into an action index
export function encodeAction(action: GameAction): number {
  switch (action.type) {
    case 'play_card':
      if (action.cardIndex === undefined) {
        throw new Error('play_card action requires cardIndex');
      }
      return ACTION_SPACE.PLAY_CARD_START + action.cardIndex;
    
    case 'attack_minion':
      if (action.attackerIndex === undefined || action.targetIndex === undefined) {
        throw new Error('attack_minion action requires attackerIndex and targetIndex');
      }
      return ACTION_SPACE.ATTACK_MINION_START + 
             (action.attackerIndex * ACTION_SPACE.MAX_BOARD_SIZE) + 
             action.targetIndex;
    
    case 'attack_face':
      if (action.attackerIndex === undefined) {
        throw new Error('attack_face action requires attackerIndex');
      }
      return ACTION_SPACE.ATTACK_FACE_START + action.attackerIndex;
    
    case 'end_turn':
      return ACTION_SPACE.END_TURN;
    
    default:
      throw new Error(`Unknown action type: ${(action as GameAction).type}`);
  }
}

// Validate taken action given the current game state
export function isActionLegal(
  action: GameAction,
  state: BattleState,
  isAI: boolean = true
): boolean {
  const player = isAI ? state.ai : state.player;
  const opponent = isAI ? state.player : state.ai;
  
  switch (action.type) {
    case 'play_card': {
      if (action.cardIndex === undefined) return false;
      
      // Check if card exists in hand
      const card = player.hand[action.cardIndex];
      if (!card) return false;
      
      // Check if enough mana
      if (card.manaCost > player.mana) return false;
      
      // Check if board has space (only for minions)
      if (card.type === 'minion' && player.board.length >= ACTION_SPACE.MAX_BOARD_SIZE) {
        return false;
      }
      
      return true;
    }
    
    case 'attack_minion': {
      if (action.attackerIndex === undefined || action.targetIndex === undefined) {
        return false;
      }
      
      // Check if attacker exists
      const attacker = player.board[action.attackerIndex];
      if (!attacker) return false;
      
      // Check if attacker can attack
      if (!attacker.canAttack) return false;
      
      // Check if target exists
      const target = opponent.board[action.targetIndex];
      if (!target) return false;
      
      // Check Taunt rules: if enemy has Taunt, must attack Taunt
      const enemyHasTaunt = opponent.board.some(minion => 
        minion.abilities?.some(ability => 
          ability.trigger === 'passive' && 
          ability.description.toLowerCase().includes('taunt')
        )
      );
      
      if (enemyHasTaunt) {
        const targetHasTaunt = target.abilities?.some(ability =>
          ability.trigger === 'passive' &&
          ability.description.toLowerCase().includes('taunt')
        );
        
        // If enemy has Taunt on the board, the target must be one that has Taunt
        if (!targetHasTaunt) return false;
      }
      
      return true;
    }
    
    case 'attack_face': {
      if (action.attackerIndex === undefined) return false;
      
      // Check if attacker exists
      const attacker = player.board[action.attackerIndex];
      if (!attacker) return false;
      
      // Check if attacker can attack
      if (!attacker.canAttack) return false;
      
      // Check Taunt rules: if enemy has Taunt, cannot attack face
      const enemyHasTaunt = opponent.board.some(minion =>
        minion.abilities?.some(ability =>
          ability.trigger === 'passive' &&
          ability.description.toLowerCase().includes('taunt')
        )
      );
      
      if (enemyHasTaunt) return false;
      
      return true;
    }
    
    case 'end_turn': {
      // End turn is always legal
      return true;
    }
    
    default:
      return false;
  }
}

// Get all legal moves in the current state
export function getLegalActions(state: BattleState, isAI: boolean = true): number[] {
  const legalActions: number[] = [];
  
  // Check all possible actions, add valid ones to the array
  for (let actionIndex = 0; actionIndex < ACTION_SPACE.TOTAL_ACTIONS; actionIndex++) {
    const action = decodeAction(actionIndex);
    if (isActionLegal(action, state, isAI)) {
      legalActions.push(actionIndex);
    }
  }
  
  return legalActions;
}

// For neural network training: filter out the moves
// that the AI can't make from its Q-values, before picking the best action
export function getLegalActionMask(state: BattleState, isAI: boolean = true): number[] {
  const mask = new Array(ACTION_SPACE.TOTAL_ACTIONS).fill(0);
  
  const legalActions = getLegalActions(state, isAI);
  for (const actionIndex of legalActions) {
    mask[actionIndex] = 1;
  }
  
  return mask;
}

// Get human-readable version of the action taken
export function getActionDescription(actionIndex: number): string {
  const action = decodeAction(actionIndex);
  
  switch (action.type) {
    case 'play_card':
      return `Play card from hand position ${action.cardIndex}`;
    
    case 'attack_minion':
      return `Minion ${action.attackerIndex} attacks enemy minion ${action.targetIndex}`;
    
    case 'attack_face':
      return `Minion ${action.attackerIndex} attacks enemy hero`;
    
    case 'end_turn':
      return 'End turn';
    
    default:
      return 'Unknown action';
  }
}