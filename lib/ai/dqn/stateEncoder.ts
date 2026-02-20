import { BattleState } from "@/lib/types/game";
import { hasTaunt } from "@/lib/game/gameLogic";

// Convert game states into neural network inputs for the DQN agent
// Returns vector of normalized values representing the game state from the AI's perspective
export function encodeGameState(state: BattleState, aiPerspective: boolean): number[] {
    const vector: number[] = [];

    const player = aiPerspective ? state.ai : state.player;
    const opponent = aiPerspective ? state.player : state.ai;

    // Basic information about player and opponent visible during any given turn
    vector.push(player.health / 30);        // Normalize health to [0,1] range
    vector.push(player.mana / 10);          // Normalize mana to [0,1] range
    vector.push(player.maxMana / 10);       // Normalize max mana to [0,1] range

    vector.push(opponent.health / 30);      // Normalize health to [0,1] range
    vector.push(opponent.mana / 10);        // Normalize mana to [0,1] range
    vector.push(opponent.maxMana / 10);     // Normalize max mana to [0,1] range

    vector.push(state.turnNumber / 30);                                             // No max turn limit, but 30 is a reasonable normalization factor for longer games
    vector.push(state.currentTurn === (aiPerspective ? 'ai' : 'player') ? 1 : 0);   // 1 if it's the AI's turn, 0 otherwise
    vector.push(opponent.hand.length / 10);                                         // Normalize opponent hand size to [0,1] range

    // Encoding for player's hand. 40 values: 10 cards x 4 features
    for (let i = 0; i < 10; i++){
        if (i < player.hand.length) {
            const card = player.hand[i];
            vector.push(card.manaCost / 10);                // Normalize mana cost to [0,1] range
            vector.push(card.type === 'minion' ? 1: 0);     // Card type: 1 for minions, 0 for spells
            vector.push((card.attack || 0) / 10);           // Normalize attack to [0,1] range, 0 for spells
            vector.push((card.health || 0) / 30);           // Normalize health to [0,1] range, 0 for spells
        } else {
            vector.push(0, 0, 0, 0);                        // Empty hand slots
        }
    }

    // Encoding for player's board. 35 values: 7 minions x 5 features
    for (let i = 0; i < 7; i++){
        if (i < player.board.length) {
            const minion = player.board[i];

            vector.push(minion.manaCost / 10);           // Normalize mana cost to [0,1] range
            vector.push(minion.attack / 10);             // Normalize attack to [0,1] range
            vector.push(minion.health / 30);             // Normalize health to [0,1] range
            vector.push(minion.canAttack ? 1 : 0);       // Can attack this turn
            vector.push(hasTaunt(minion) ? 1 : 0);       // Has taunt
        } else {
            vector.push(0, 0, 0, 0, 0);            // Empty board slots
        }
    }

    // Encoding for opponent's board. 35 values: 7 minions x 5 features
    for (let i = 0; i < 7; i++){
        if (i < opponent.board.length) {
            const minion = opponent.board[i];

            vector.push(minion.manaCost / 10);           // Normalize mana cost to [0,1] range
            vector.push(minion.attack / 10);             // Normalize attack to [0,1] range
            vector.push(minion.health / 30);             // Normalize health to [0,1] range
            vector.push(minion.canAttack ? 1 : 0);       // Can attack this turn
            vector.push(hasTaunt(minion) ? 1 : 0);       // Has taunt
        } else {
            vector.push(0, 0, 0, 0, 0);            // Empty board slots
        }
    }

    // Deck info
    vector.push(player.deck.length / 30);        // Normalize deck size to [0,1] range
    vector.push(opponent.deck.length / 30);      // Normalize deck size to [0,1] range

    // Return total of 121 values representing the game state from the AI's perspective
    return vector;
}

// Get a human-readable description for what each index in the encoded state vector means
export function getStateDescription(): string[] {
    const description: string[] = [];

    // Basic info
    description.push("Player Health");
    description.push("Player Mana");
    description.push("Player Max Mana");
    description.push("Opponent Health");
    description.push("Opponent Mana");
    description.push("Opponent Max Mana");
    description.push("Turn Number");
    description.push("Is Player's Turn");
    description.push("Opponent Hand Size");

    // Player's hand (10 cards x 4 features)
    for (let i = 0; i < 10; i++) {
        description.push(`Card in Hand Slot ${i+1} - Mana Cost`);
        description.push(`Card in Hand Slot ${i+1} - Is Minion`);
        description.push(`Card in Hand Slot ${i+1} - Attack`);
        description.push(`Card in Hand Slot ${i+1} - Health`);
    }

    // Player's board (7 minions x 5 features)
    for (let i = 0; i < 7; i++) {
        description.push(`Minion on Board Slot ${i+1} - Mana Cost`);
        description.push(`Minion on Board Slot ${i+1} - Attack`);
        description.push(`Minion on Board Slot ${i+1} - Health`);
        description.push(`Minion on Board Slot ${i+1} - Can Attack`);
        description.push(`Minion on Board Slot ${i+1} - Has Taunt`);
    }

    // Opponent's board (7 minions x 5 features)
    for (let i = 0; i < 7; i++) {
        description.push(`Opponent Minion on Board Slot ${i+1} - Mana Cost`);
        description.push(`Opponent Minion on Board Slot ${i+1} - Attack`);
        description.push(`Opponent Minion on Board Slot ${i+1} - Health`);
        description.push(`Opponent Minion on Board Slot ${i+1} - Can Attack`);
        description.push(`Opponent Minion on Board Slot ${i+1} - Has Taunt`);
    }

    // Deck info
    description.push("Player Deck Size");
    description.push("Opponent Deck Size");

    return description;
}