import { create } from 'zustand';
import { BattleState, Card, Minion } from '../types/game';
import { CARDS } from '../data/cards';

const createStartingDeck = (): Card[] => {
  // Simple: 2 copies of each card
  return CARDS.flatMap(card => [card, { ...card }]);
};

const drawCards = (deck: Card[], count: number): { drawn: Card[], remaining: Card[] } => {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
};

interface BattleStore extends BattleState {
  playCard: (cardIndex: number, targetId?: string) => void;
  attack: (attackerId: string, targetId: string) => void;
  endTurn: () => void;
  resetBattle: () => void;
}

const createInitialState = (): BattleState => {
  const playerDeck = createStartingDeck();
  const aiDeck = createStartingDeck();
  
  const playerDraw = drawCards(playerDeck, 4);
  const aiDraw = drawCards(aiDeck, 4);
  
  return {
    player: {
      health: 30,
      mana: 1,
      maxMana: 1,
      hand: playerDraw.drawn,
      board: [],
      deck: playerDraw.remaining,
    },
    ai: {
      health: 30,
      mana: 1,
      maxMana: 1,
      hand: aiDraw.drawn,
      board: [],
      deck: aiDraw.remaining,
    },
    currentTurn: 'player',
    turnNumber: 1,
    gameOver: false,
  };
};

export const useBattleStore = create<BattleStore>((set, get) => ({
  ...createInitialState(),
  
  playCard: (cardIndex: number, targetId?: string) => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;
    
    const card = state.player.hand[cardIndex];
    if (!card || card.manaCost > state.player.mana) return;
    
    const newHand = state.player.hand.filter((_, i) => i !== cardIndex);
    const newMana = state.player.mana - card.manaCost;
    
    if (card.type === 'minion') {
      const minion: Minion = {
        ...card,
        type: 'minion',
        attack: card.attack!,
        health: card.health!,
        currentHealth: card.health!,
        canAttack: false,
        instanceId: `${card.id}-${Date.now()}`,
      };
      
      set({
        player: {
          ...state.player,
          hand: newHand,
          mana: newMana,
          board: [...state.player.board, minion],
        },
      });
    } else {
      // Handle spells (simplified for now)
      set({
        player: {
          ...state.player,
          hand: newHand,
          mana: newMana,
        },
      });
    }
  },
  
  attack: (attackerId: string, targetId: string) => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;
    
    const attacker = state.player.board.find(m => m.instanceId === attackerId);
    if (!attacker || !attacker.canAttack) return;
    
    if (targetId === 'face') {
      set({
        ai: { ...state.ai, health: state.ai.health - attacker.attack },
        player: {
          ...state.player,
          board: state.player.board.map(m =>
            m.instanceId === attackerId ? { ...m, canAttack: false } : m
          ),
        },
      });
      
      if (state.ai.health - attacker.attack <= 0) {
        set({ gameOver: true, winner: 'player' });
      }
    } else {
      const target = state.ai.board.find(m => m.instanceId === targetId);
      if (!target) return;
      
      const newAttacker = { ...attacker, currentHealth: attacker.currentHealth - target.attack, canAttack: false };
      const newTarget = { ...target, currentHealth: target.currentHealth - attacker.attack };
      
      set({
        player: {
          ...state.player,
          board: state.player.board
            .map(m => m.instanceId === attackerId ? newAttacker : m)
            .filter(m => m.currentHealth > 0),
        },
        ai: {
          ...state.ai,
          board: state.ai.board
            .map(m => m.instanceId === targetId ? newTarget : m)
            .filter(m => m.currentHealth > 0),
        },
      });
    }
  },
  
  endTurn: () => {
    const state = get();
    if (state.currentTurn !== 'player' || state.gameOver) return;
    
    // Simple AI: play first affordable card
    let aiState = { ...state.ai };
    
    const playableCard = aiState.hand.find(c => c.manaCost <= aiState.mana);
    if (playableCard && playableCard.type === 'minion') {
      const minion: Minion = {
        ...playableCard,
        type: 'minion',
        attack: playableCard.attack!,
        health: playableCard.health!,
        currentHealth: playableCard.health!,
        canAttack: false,
        instanceId: `${playableCard.id}-${Date.now()}`,
      };
      aiState = {
        ...aiState,
        hand: aiState.hand.filter(c => c.id !== playableCard.id),
        mana: aiState.mana - playableCard.manaCost,
        board: [...aiState.board, minion],
      };
    }
    
    // AI attacks with all minions
    let playerHealth = state.player.health;
    aiState.board.forEach(minion => {
      if (minion.canAttack) {
        playerHealth -= minion.attack;
      }
    });
    
    // Draw card and increment turn
    const newMaxMana = Math.min(state.player.maxMana + 1, 10);
    const playerDraw = drawCards(state.player.deck, 1);
    
    set({
      currentTurn: 'player',
      turnNumber: state.turnNumber + 1,
      player: {
        ...state.player,
        health: playerHealth,
        maxMana: newMaxMana,
        mana: newMaxMana,
        hand: [...state.player.hand, ...playerDraw.drawn],
        deck: playerDraw.remaining,
        board: state.player.board.map(m => ({ ...m, canAttack: true })),
      },
      ai: {
        ...aiState,
        maxMana: newMaxMana,
        mana: newMaxMana,
        board: aiState.board.map(m => ({ ...m, canAttack: true })),
      },
      gameOver: playerHealth <= 0,
      winner: playerHealth <= 0 ? 'ai' : undefined,
    });
  },
  
  resetBattle: () => set(createInitialState()),
}));