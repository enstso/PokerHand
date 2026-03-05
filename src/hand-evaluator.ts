import type { Card, Rank } from "./card.js";

export type HandCategory = "HIGH_CARD" | "ONE_PAIR" | "TWO_PAIR";

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

  const rankValues = cards.map((card) => RANK_VALUE[card.rank]);
  const counts = new Map<number, number>();

  for (const value of rankValues) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const pairRanks = [...counts.entries()]
    .filter(([, count]) => count === 2)
    .map(([rank]) => rank)
    .sort((a, b) => b - a);

  if (pairRanks.length === 2) {
    const [highPair, lowPair] = pairRanks;
    if (highPair === undefined || lowPair === undefined) {
      throw new Error("Two pair rank resolution failed");
    }

    const kicker = rankValues.find((rank) => rank !== highPair && rank !== lowPair);
    if (kicker === undefined) {
      throw new Error("Two pair kicker resolution failed");
    }

    return {
      category: "TWO_PAIR",
      tiebreak: [highPair, lowPair, kicker]
    };
  }

  if (pairRanks.length === 1) {
    const pairRank = pairRanks[0];
    if (pairRank === undefined) {
      throw new Error("Pair rank resolution failed");
    }
    const kickers = rankValues
      .filter((rank) => rank !== pairRank)
      .sort((a, b) => b - a);

    return {
      category: "ONE_PAIR",
      tiebreak: [pairRank, ...kickers]
    };
  }

  const tiebreak = rankValues.sort((a, b) => b - a);

  return {
    category: "HIGH_CARD",
    tiebreak
  };
}
