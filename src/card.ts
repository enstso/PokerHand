export const RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A"
] as const;

export const SUITS = ["C", "D", "H", "S"] as const;

export type Rank = (typeof RANKS)[number];
export type Suit = (typeof SUITS)[number];

export type Card = {
  rank: Rank;
  suit: Suit;
};

// Parses a card notation like "AS" into a Card object { rank: "A", suit: "S" }
export function parseCard(notation: string): Card {
  if (notation.length !== 2) {
    throw new Error("Invalid format");
  }

  const [rank, suit] = notation;

  if (!RANKS.includes(rank as Rank)) {
    throw new Error("Invalid rank");
  }

  if (!SUITS.includes(suit as Suit)) {
    throw new Error("Invalid suit");
  }

  return { rank: rank as Rank, suit: suit as Suit };
}
