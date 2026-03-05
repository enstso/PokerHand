import type { Card, Rank } from "./card.js";

export type HandCategory = "HIGH_CARD";

export type HandEvaluation = {
  category: HandCategory;
  tiebreak: number[];
};

const RANK_VALUE: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14
};

export function evaluate5(cards: Card[]): HandEvaluation {
  if (cards.length !== 5) {
    throw new Error("evaluate5 requires exactly 5 cards");
  }

  const tiebreak = cards.map((card) => RANK_VALUE[card.rank]).sort((a, b) => b - a);

  return {
    category: "HIGH_CARD",
    tiebreak
  };
}
