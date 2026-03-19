// Structure deck definitions file
// Each deck is 30 cards max, with unique card IDs (copies get "-copy1", "-copy2").
// Legendary rarity cards are limited to 1 copy; all other rarities allow up to 2.
//
// Trying to hit a balanced mana curve with a focus on tempo (early-mid aggression) for the two structure decks,
// just for the scope of demos and testing. Future decks might go more defensive, control, or combo-oriented builds.

import { DeckArchetype } from "../types/game";
import { CARDS } from "./cards";
import { Card } from "../types/game";

// A single entry in a structure deck definition:
// which card ID and how many copies of that card to include
interface StructureDeckEntry {
  id: string;
  copies: number;
}

// The full structure deck definition for one archetype
interface StructureDeckDefinition {
  archetype: DeckArchetype;
  name: string;
  entries: StructureDeckEntry[];
}

// --------------------------------------------------------------------------------
// FIRE STRUCTURE DECK — Aggressive Tempo
//
// Strategy: Apply early pressure with aggressive minions and burn
// spells, close out the game with high-attack charge minions and
// direct damage. Brian Boru and Fomorian Pyromaniac punish the
// opponent for not controlling the board.
//
// Mana Curve:
//   1-mana (4):  Fianna Scout ×2, Ember Sprite ×2
//   2-mana (6):  Warrior of Maedhbh ×2, Burning Zealot ×2, Bealtaine Flames ×2
//   3-mana (6):  Connacht Raider ×2, Wildfire ×2, Village Elder ×2
//   4-mana (6):  Red Branch Knight ×2, Furbolg Bruiser ×2, Wandering Bard ×2
//   5-mana (4):  Cúchulainn's Wrath ×2, Brian Boru ×2
//   6-mana (3):  Scáthach ×1, Fomorian Pyromaniac ×1, Fireblast ×1
//   7-mana (1):  Queen Maedhbh ×1
// --------------------------------------------------------------------------------
const FIRE_STRUCTURE_DECK: StructureDeckDefinition = {
  archetype: "fire",
  name: "Connacht Warriors",
  entries: [
    // 1-mana (4 cards)
    { id: "f_common_1", copies: 2 }, // Fianna Scout (1/2) - fast early drop
    { id: "f_common_4", copies: 2 }, // Ember Sprite (1/2, deathrattle: 2 face damage)

    // 2-mana (6 cards)
    { id: "f_common_2", copies: 2 }, // Warrior of Maedhbh (3/2) - aggressive 2-drop
    { id: "f_common_7", copies: 2 }, // Burning Zealot (2/2, battlecry: 1 face damage)
    { id: "f_spell_1", copies: 2 }, // Bealtaine Flames (spell: 3 face damage)

    // 3-mana (6 cards)
    { id: "f_common_5", copies: 2 }, // Connacht Raider (4/2) - high attack tempo
    { id: "f_spell_3", copies: 2 }, // Wildfire (spell: 2 random minion + 2 face)
    { id: "n_common_3", copies: 2 }, // Village Elder (3/3, battlecry: draw a card)

    // 4-mana (6 cards)
    { id: "f_rare_1", copies: 2 }, // Red Branch Knight (4/3, charge)
    { id: "f_common_6", copies: 2 }, // Furbolg Bruiser (5/3) - heavy 4-drop
    { id: "n_common_4", copies: 2 }, // Wandering Bard (3/5) - sticky midrange body

    // 5-mana (4 cards)
    { id: "f_rare_2", copies: 2 }, // Cúchulainn's Wrath (6/2, charge + deathrattle: 2 face)
    { id: "n_rare_1", copies: 2 }, // Brian Boru (4/4, battlecry: +1/+1 to all friendlies)

    // 6-mana (3 cards) — epics also soft-capped at 1 copy each here to fill the deck up
    { id: "f_epic_1", copies: 1 }, // Scáthach (5/4, battlecry: 2 face damage)
    { id: "f_epic_2", copies: 1 }, // Fomorian Pyromaniac (5/5, battlecry: +1 attack all friendlies)
    { id: "f_spell_2", copies: 1 }, // Fireblast (spell: 5 face damage)

    // 7-mana (1 card)
    { id: "f_leg_1", copies: 1 }, // Queen Maedhbh (6/6, charge + battlecry: 1 damage all enemies)
  ],
};

// --------------------------------------------------------------------------------
// EARTH STRUCTURE DECK — Defensive Tempo
//
// Strategy: Develop taunt minions to absorb damage while healing
// keeps health totals high. Draw spells maintain card advantage
// into the late game, and Brian Boru turns a wide taunt board into
// an easy win.
//
// Mana Curve:
//   1-mana (4):  Grove Tender ×2, Healing Wisp ×2
//   2-mana (6):  Stone Circle Guardian ×2, Druid Apprentice ×2, Healing Springs ×2
//   3-mana (6):  Earthen Protector ×2, Bounty of Nature ×2, Village Elder ×2
//   4-mana (6):  Dian Cécht ×2, Ironbark Protector ×2, Wandering Bard ×2
//   5-mana (4):  Ancient Oak ×2, Brian Boru ×2
//   6-mana (3):  St. Brigid ×1, Ancient of Life ×1, Moss Giant ×1
//   7-mana (1):  The Dagda ×1
// --------------------------------------------------------------------------------
const EARTH_STRUCTURE_DECK: StructureDeckDefinition = {
  archetype: "earth",
  name: "Munster Endurance",
  entries: [
    // 1-mana (4 cards)
    { id: "e_common_3", copies: 2 }, // Grove Tender (1/3, battlecry: restore 2 health)
    { id: "e_common_7", copies: 2 }, // Healing Wisp (1/1, deathrattle: restore 2 health)

    // 2-mana (6 cards)
    { id: "e_common_2", copies: 2 }, // Stone Circle Guardian (1/4, taunt)
    { id: "e_common_5", copies: 2 }, // Druid Apprentice (2/3) - solid 2-drop body
    { id: "e_spell_1", copies: 2 }, // Healing Springs (spell: restore 5 health)

    // 3-mana (6 cards)
    { id: "e_rare_4", copies: 2 }, // Earthen Protector (2/5, taunt) - early taunt wall
    { id: "e_spell_2", copies: 2 }, // Bounty of Nature (spell: restore 3 health + draw)
    { id: "n_common_3", copies: 2 }, // Village Elder (3/3, battlecry: draw a card)

    // 4-mana (6 cards)
    { id: "e_rare_1", copies: 2 }, // Dian Cécht (2/6, battlecry: restore 4 health)
    { id: "e_common_4", copies: 2 }, // Ironbark Protector (2/6, taunt)
    { id: "n_common_4", copies: 2 }, // Wandering Bard (3/5) - sticky mid body

    // 5-mana (4 cards)
    { id: "e_rare_2", copies: 2 }, // Ancient Oak (2/8, taunt + deathrattle: restore 3 health)
    { id: "n_rare_1", copies: 2 }, // Brian Boru (4/4, battlecry: +1/+1 to all friendlies)

    // 6-mana (3 cards) — legendaries and epics each capped at 1 copy
    { id: "e_leg_1", copies: 1 }, // St. Brigid (4/7, taunt + battlecry: restore 6 health)
    { id: "e_epic_2", copies: 1 }, // Ancient of Life (3/8, taunt + deathrattle: restore 5 health)
    { id: "e_rare_3", copies: 1 }, // Moss Giant (4/8, taunt) - massive taunt body

    // 7-mana (1 card)
    { id: "e_leg_2", copies: 1 }, // The Dagda (5/8, taunt + battlecry: restore 4 health + draw)
  ],
};

// Map each archetype to its structure deck definition for easy lookup by the deck builder function below this one.
// (Water and Air archetypes are placeholders for future decks, currently reusing the Fire and Earth definitions)
export const STRUCTURE_DECKS: Record<DeckArchetype, StructureDeckDefinition> = {
  fire: FIRE_STRUCTURE_DECK,
  earth: EARTH_STRUCTURE_DECK,
  water: FIRE_STRUCTURE_DECK,
  air: EARTH_STRUCTURE_DECK,
};

// Build a Card array from a structure deck definition object
// Looks up each card ID in the global CARDS pool, creates the
// correct number of copies, and returns the full list.
// Throws if any card ID in the definition is not found in CARDS
export function buildStructureDeck(archetype: DeckArchetype): Card[] {
  const definition = STRUCTURE_DECKS[archetype];

  const deck: Card[] = [];

  for (const entry of definition.entries) {
    const baseCard = CARDS.find((c) => c.id === entry.id);

    if (!baseCard) {
      throw new Error(
        `[buildStructureDeck] Card ID "${entry.id}" not found in CARDS pool. ` +
          `Check decks.ts entries for the "${archetype}" structure deck.`,
      );
    }

    for (let i = 0; i < entry.copies; i++) {
      deck.push({
        ...baseCard,
        id: `${baseCard.id}-copy${i + 1}`,
      });
    }
  }

  return deck;
}
