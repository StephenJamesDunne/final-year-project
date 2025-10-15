import { create } from 'zustand';
import { BattleState, Card, Minion } from '../types/game';
import { CARDS } from '../data/cards';

// Function to shuffle both decks before starting a match
const shuffleDeck = <T>(array: T[]): T[] => {
  const shuffledDeck = [...array];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
};

const createStartingDeck = (): Card[] => {
  // Simple: 2 copies of each card
  const deck = CARDS.flatMap(card => [
    { ...card, id: `${card.id}-copy1` },
    { ...card, id: `${card.id}-copy2` }
  ]);

  // Shuffle both decks
  return shuffleDeck(deck);
};

const drawCards = (deck: Card[], count: number): { drawn: Card[], remaining: Card[] } => {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
};

// Process card abilities when they trigger
function processAbilities(
  card: Card,
  trigger: 'battlecry' | 'deathrattle' | 'end_of_turn',
  state: BattleState,
  isPlayer: boolean
): BattleState {
  if (!card.abilities) return state;

  const relevantAbilities = card.abilities.filter(a => a.trigger === trigger);
  let newState = { ...state };

  relevantAbilities.forEach(ability => {
    const currentPlayer = isPlayer ? newState.player : newState.ai;
    const opponent = isPlayer ? newState.ai : newState.player;

    switch (ability.type) {
      case 'draw':
        const drawn = drawCards(currentPlayer.deck, ability.value || 1);
        currentPlayer.hand = [...currentPlayer.hand, ...drawn.drawn];
        currentPlayer.deck = drawn.remaining;
        break;

      case 'heal':
        if (ability.target === 'self') {
          currentPlayer.health = Math.min(currentPlayer.health + (ability.value || 0), 30);
        }
        break;

      case 'damage':
        if (ability.target === 'enemy') {
          opponent.health -= ability.value || 0;
        } else if (ability.target === 'all') {
          // Damage all enemy minions
          opponent.board = opponent.board.map(m => ({
            ...m,
            currentHealth: m.currentHealth - (ability.value || 0)
          })).filter(m => m.currentHealth > 0);

          // Also damage enemy hero for cards like Balor
          if (trigger === 'end_of_turn') {
            opponent.health -= ability.value || 0;
            currentPlayer.health -= ability.value || 0; // Damage friendly side too

            // Damage friendly minions
            currentPlayer.board = currentPlayer.board.map(m => ({
              ...m,
              currentHealth: m.currentHealth - (ability.value || 0)
            })).filter(m => m.currentHealth > 0);
          }
        }
        break;

      case 'summon':
        // Basic implementation - summon generic tokens
        // TODO: Implement specific minion summoning
        break;

      case 'buff':
        // TODO: Implement when adding targeting system
        break;

      case 'destroy':
        // TODO: Implement when adding targeting system
        break;
    }
  });

  return newState;
}

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
    combatLog: ["The sound of battle roars across the Five Realms!"],
    aiAction: undefined,
  };
};

// Helper to extract just the state data
const getStateData = (state: BattleStore): BattleState => ({
  player: state.player,
  ai: state.ai,
  currentTurn: state.currentTurn,
  turnNumber: state.turnNumber,
  gameOver: state.gameOver,
  winner: state.winner,
  combatLog: state.combatLog,
  aiAction: state.aiAction,
});

export const useBattleStore = create<BattleStore>((set, get) => {
  const initialState = createInitialState();

  return {
    ...initialState,

    playCard: (cardIndex: number, targetId?: string) => {
      const store = get();
      const state = getStateData(store);

      if (state.currentTurn !== 'player' || state.gameOver) return;

      const card = state.player.hand[cardIndex];
      if (!card || card.manaCost > state.player.mana) return;

      const newHand = state.player.hand.filter((_, i) => i !== cardIndex);
      const newMana = state.player.mana - card.manaCost;

      // Start with updated hand and mana
      let newState = {
        ...state,
        player: {
          ...state.player,
          hand: newHand,
          mana: newMana,
        }
      };

      if (card.type === 'minion') {
        // Create minion and add to board
        const minion: Minion = {
          ...card,
          type: 'minion',
          attack: card.attack!,
          health: card.health!,
          currentHealth: card.health!,
          canAttack: false,
          instanceId: `${card.id}-${Date.now()}`,
        };

        newState.player.board = [...newState.player.board, minion];

        // Process battlecry abilities AFTER minion is on board
        newState = processAbilities(card, 'battlecry', newState, true);

        set(newState);
      } else {
        // Spell: process battlecry abilities immediately
        newState = processAbilities(card, 'battlecry', newState, true);
        set(newState);
      }
    },

    attack: (attackerId: string, targetId: string) => {
      const state = get();
      if (state.currentTurn !== 'player' || state.gameOver) return;

      const attacker = state.player.board.find(m => m.instanceId === attackerId);
      if (!attacker || !attacker.canAttack) return;

      if (targetId === 'face') {
        const newAIHealth = state.ai.health - attacker.attack;

        set({
          ai: { ...state.ai, health: newAIHealth },
          player: {
            ...state.player,
            board: state.player.board.map(m =>
              m.instanceId === attackerId ? { ...m, canAttack: false } : m
            ),
          },
          gameOver: newAIHealth <= 0,
          winner: newAIHealth <= 0 ? 'player' : undefined,
        });
      } else {
        const target = state.ai.board.find(m => m.instanceId === targetId);
        if (!target) return;

        const newAttacker = {
          ...attacker,
          currentHealth: attacker.currentHealth - target.attack,
          canAttack: false
        };
        const newTarget = {
          ...target,
          currentHealth: target.currentHealth - attacker.attack
        };

        let newState: BattleState = { ...state };

        // Check if target dies - trigger deathrattle
        if (newTarget.currentHealth <= 0 && target.abilities) {
          newState = processAbilities(target, 'deathrattle', newState, false);
        }

        // Check if attacker dies - trigger deathrattle
        if (newAttacker.currentHealth <= 0 && attacker.abilities) {
          newState = processAbilities(attacker, 'deathrattle', newState, true);
        }

        // Update boards (remove dead minions)
        newState.player.board = newState.player.board
          .map(m => m.instanceId === attackerId ? newAttacker : m)
          .filter(m => m.currentHealth > 0);

        newState.ai.board = newState.ai.board
          .map(m => m.instanceId === targetId ? newTarget : m)
          .filter(m => m.currentHealth > 0);

        set(newState);
      }
    },

    endTurn: async () => {
      const state = get();
      if (state.currentTurn !== 'player' || state.gameOver) return;

      set({ ...state, currentTurn: 'ai' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Process end of turn effects for player minions
      let newState: BattleState = { ...state, currentTurn: 'ai' };
      state.player.board.forEach(minion => {
        newState = processAbilities(minion, 'end_of_turn', newState, true);
      });

      // Simple AI: play first affordable card
      let aiState = { ...newState.ai };
      let currentLog = [...newState.combatLog];

      const playableCard = aiState.hand.find(c => c.manaCost <= aiState.mana);
      if (playableCard && playableCard.type === 'minion') {

        currentLog.push(`Enemy summons ${playableCard.name} (${playableCard.manaCost} mana)`);

        set({
          ...newState,
          currentTurn: 'ai',
          combatLog: currentLog,
          aiAction: `Summoning ${playableCard.name}...`,
          // TODO: aiAction property later when types are updated
        });
        await new Promise(resolve => setTimeout(resolve, 800)); // Shows card being played

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

        // Process AI battlecry
        newState.ai = aiState;
        newState = processAbilities(playableCard, 'battlecry', newState, false);
        aiState = newState.ai;

        // Log battlecry effects
        if (playableCard.abilities?.some(a => a.trigger === 'battlecry')) {
          currentLog.push(`${playableCard.name}'s battlecry triggers`);
        }

        set({ ...newState, currentTurn: 'ai', combatLog: currentLog });
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      // Process AI end of turn effects
      aiState.board.forEach(minion => {
        newState = processAbilities(minion, 'end_of_turn', newState, false);
      });

      // AI attacks with all minions
      if (aiState.board.length > 0) {
        currentLog.push(`Enemy attacks: (${aiState.board.filter(m => m.canAttack).length} minions)`);

        set({ ...newState, currentTurn: 'ai', combatLog: currentLog, aiAction: 'Attacking...' });
        await new Promise(resolve => setTimeout(resolve, 800)); // Shows attacks happening
      }

      let playerHealth = newState.player.health;
      let totalDamage = 0;
      aiState.board.forEach(minion => {
        if (minion.canAttack) {
          playerHealth -= minion.attack;
          totalDamage += minion.attack;
        }
      });

      if (totalDamage > 0) {
        currentLog.push(`Enemy deals ${totalDamage} damage to you`);
      }

      // Draw card and increment turn
      const newMaxMana = Math.min(newState.player.maxMana + 1, 10);
      const playerDraw = drawCards(newState.player.deck, 1);
      const aiDraw = drawCards(aiState.deck, 1);

      if (playerDraw.drawn.length > 0) {
        currentLog.push(`You draw: ${playerDraw.drawn[0].name}`);
      }

      currentLog.push(`Your turn begins! (${newMaxMana} mana available)`);

      set({
        currentTurn: 'player',
        turnNumber: newState.turnNumber + 1,
        combatLog: currentLog,
        aiAction: undefined,
        // Update both sides
        player: {
          ...newState.player,
          health: playerHealth,
          maxMana: newMaxMana,
          mana: newMaxMana,
          hand: [...newState.player.hand, ...playerDraw.drawn],
          deck: playerDraw.remaining,
          board: newState.player.board.map(m => ({ ...m, canAttack: true })),
        },
        ai: {
          ...aiState,
          maxMana: newMaxMana,
          mana: newMaxMana,
          hand: [...aiState.hand, ...aiDraw.drawn],
          deck: aiDraw.remaining,
          board: aiState.board.map(m => ({ ...m, canAttack: true })),
        },
        gameOver: playerHealth <= 0 || newState.ai.health <= 0,
        winner: playerHealth <= 0 ? 'ai' : (newState.ai.health <= 0 ? 'player' : undefined),
      });
    },

    resetBattle: () => set(createInitialState()),
  };
});