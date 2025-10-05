export type Element = 'fire' | 'water' | 'earth' | 'air' | 'spirit' | 'neutral';
export type CardType = 'minion' | 'spell';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Card {
  id: string;
  name: string;
  element: Element;
  type: CardType;
  rarity: Rarity;
  manaCost: number;
  attack?: number; // minions only
  health?: number; // minions only
  description: string;
}

export interface Minion extends Card {
  type: 'minion';
  attack: number;
  health: number;
  currentHealth: number;
  canAttack: boolean;
  instanceId: string; // unique ID for this copy on board
}

export interface Player {
  health: number;
  mana: number;
  maxMana: number;
  hand: Card[];
  board: Minion[];
  deck: Card[];
}

export interface BattleState {
  player: Player;
  ai: Player;
  currentTurn: 'player' | 'ai';
  turnNumber: number;
  gameOver: boolean;
  winner?: 'player' | 'ai';
}