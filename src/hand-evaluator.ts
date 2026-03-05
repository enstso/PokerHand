import type { Card, Rank } from "./card.js";

export type HandCategory =
  | "HIGH_CARD"
  | "ONE_PAIR"
  | "TWO_PAIR"
  | "THREE_OF_A_KIND"
  | "FLUSH"
  | "STRAIGHT";

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

function getStraightHighCard(rankValues: number[]): number | null {
  const uniqueRanks = [...new Set(rankValues)].sort((a, b) => a - b);

  if (uniqueRanks.length !== 5) {
    return null;
  }

  const isWheel =
    uniqueRanks[0] === 2 &&
    uniqueRanks[1] === 3 &&
    uniqueRanks[2] === 4 &&
    uniqueRanks[3] === 5 &&
    uniqueRanks[4] === 14;

  if (isWheel) {
    return 5;
  }

  for (let index = 1; index < uniqueRanks.length; index += 1) {
    const previousRank = uniqueRanks[index - 1];
    const currentRank = uniqueRanks[index];

    if (previousRank === undefined || currentRank === undefined) {
      return null;
    }

    if (currentRank - previousRank !== 1) {
      return null;
    }
  }

  const highestRank = uniqueRanks[uniqueRanks.length - 1];
  return highestRank ?? null;
}

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
  const tripRanks = [...counts.entries()]
    .filter(([, count]) => count === 3)
    .map(([rank]) => rank)
    .sort((a, b) => b - a);
  const straightHighCard = getStraightHighCard(rankValues);
  const firstSuit = cards[0]?.suit;
  const isFlush = firstSuit !== undefined && cards.every((card) => card.suit === firstSuit);

  if (isFlush) {
    const flushRanks = [...rankValues].sort((a, b) => b - a);

    return {
      category: "FLUSH",
      tiebreak: flushRanks
    };
  }

  if (straightHighCard !== null) {
    return {
      category: "STRAIGHT",
      tiebreak: [straightHighCard]
    };
  }

  if (tripRanks.length === 1) {
    const tripRank = tripRanks[0];
    if (tripRank === undefined) {
      throw new Error("Three of a kind rank resolution failed");
    }

    const kickers = rankValues
      .filter((rank) => rank !== tripRank)
      .sort((a, b) => b - a);

    return {
      category: "THREE_OF_A_KIND",
      tiebreak: [tripRank, ...kickers]
    };
  }

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
