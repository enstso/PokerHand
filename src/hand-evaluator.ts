import type { Card, Rank } from "./card.js";
import { compareHandValues } from "./hand-comparator.js";

export type HandCategory =
  | "HIGH_CARD"
  | "STRAIGHT_FLUSH"
  | "ONE_PAIR"
  | "TWO_PAIR"
  | "THREE_OF_A_KIND"
  | "FOUR_OF_A_KIND"
  | "FULL_HOUSE"
  | "FLUSH"
  | "STRAIGHT";

export type HandEvaluation = {
  category: HandCategory;
  tiebreak: number[];
};

export type BestOfSevenEvaluation = HandEvaluation & {
  chosen5: Card[];
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

// This function generates a unique string representation of a card based on its rank and suit, which is used for detecting duplicates in the hand evaluation process.
function notationOf(card: Card): string {
  return `${card.rank}${card.suit}`;
}

// This function checks for duplicate cards in the given array and throws an error if any duplicates are found, ensuring that the hand evaluation is based on valid card combinations.
export function assertNoDuplicateCards(cards: Card[]): void {
  const seen = new Set<string>();

  for (const card of cards) {
    const notation = notationOf(card);
    if (seen.has(notation)) {
      throw new Error(`Duplicate card: ${notation}`);
    }
    seen.add(notation);
  }
}

// This function checks if the given rank values form a straight and returns the high card of the straight if they do, or null if they don't. It also handles the special case of a "wheel" straight (A-2-3-4-5).
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
// This function is used to safely access cards by index during the best-of-seven evaluation.
function getCardAt(cards: Card[], index: number): Card {
  const card = cards[index];
  if (card === undefined) {
    throw new Error("Card index out of range");
  }
  return card;
}

// This function is used to determine the rank value of a card for evaluation and sorting purposes.
function rankValueOf(card: Card): number {
  return RANK_VALUE[card.rank];
}

// This function groups cards by their rank value, which is useful for evaluating hand categories like pairs, three of a kind, etc.
function groupCardsByRank(cards: Card[]): Map<number, Card[]> {
  const groups = new Map<number, Card[]>();

  for (const card of cards) {
    const rankValue = rankValueOf(card);
    const group = groups.get(rankValue);
    if (group === undefined) {
      groups.set(rankValue, [card]);
      continue;
    }
    group.push(card);
  }

  return groups;
}

// This function sorts cards in descending order of their rank value, which is important for tie-breaking scenarios in hand evaluation.
function sortCardsByRankDesc(cards: Card[]): Card[] {
  return cards
    .map((card, index) => ({ card, index, rankValue: rankValueOf(card) }))
    .sort((left, right) => {
      if (left.rankValue !== right.rankValue) {
        return right.rankValue - left.rankValue;
      }
      return left.index - right.index;
    })
    .map(({ card }) => card);
}

// This function orders cards according to the specified rank groups, which is essential for correctly evaluating hand categories that depend on the grouping of ranks (e.g., pairs, three of a kind).
function orderCardsByRankGroups(cards: Card[], rankOrder: number[]): Card[] {
  const groups = groupCardsByRank(cards);
  const ordered: Card[] = [];

  for (const rank of rankOrder) {
    const group = groups.get(rank);
    if (group === undefined || group.length === 0) {
      throw new Error("Unable to order cards by rank groups");
    }
    ordered.push(...group);
  }

  if (ordered.length !== cards.length) {
    throw new Error("Ordered cards length mismatch");
  }

  return ordered;
}

// This function orders the cards in a straight or straight flush according to the high card of the straight, which is crucial for correctly evaluating and comparing straight hands.
function orderStraightCards(cards: Card[], highCard: number): Card[] {
  const rankOrder =
    highCard === 5
      ? [5, 4, 3, 2, 14]
      : [highCard, highCard - 1, highCard - 2, highCard - 3, highCard - 4];
  const groups = groupCardsByRank(cards);
  const ordered: Card[] = [];

  for (const rank of rankOrder) {
    const card = groups.get(rank)?.[0];
    if (card === undefined) {
      throw new Error("Unable to order straight cards");
    }
    ordered.push(card);
  }

  return ordered;
}

// This function determines the order of the chosen 5 cards for a best-of-seven evaluation based on the hand category and tiebreak information, ensuring that the cards are ordered correctly for tie-breaking comparisons.
function orderChosen5(cards: Card[], evaluation: HandEvaluation): Card[] {
  switch (evaluation.category) {
    case "STRAIGHT":
    case "STRAIGHT_FLUSH": {
      const highCard = evaluation.tiebreak[0];
      if (highCard === undefined) {
        throw new Error("Missing straight high card");
      }
      return orderStraightCards(cards, highCard);
    }
    case "FOUR_OF_A_KIND":
    case "FULL_HOUSE":
    case "THREE_OF_A_KIND":
    case "TWO_PAIR":
    case "ONE_PAIR":
      return orderCardsByRankGroups(cards, evaluation.tiebreak);
    case "FLUSH":
    case "HIGH_CARD":
      return sortCardsByRankDesc(cards);
  }
}

// This function evaluates a 5-card hand and determines its category and tiebreak information, which is essential for comparing hands and determining winners in poker games.
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
  const quadRanks = [...counts.entries()]
    .filter(([, count]) => count === 4)
    .map(([rank]) => rank)
    .sort((a, b) => b - a);
  const straightHighCard = getStraightHighCard(rankValues);
  const firstSuit = cards[0]?.suit;
  const isFlush = firstSuit !== undefined && cards.every((card) => card.suit === firstSuit);

  if (isFlush && straightHighCard !== null) {
    return {
      category: "STRAIGHT_FLUSH",
      tiebreak: [straightHighCard]
    };
  }

  if (quadRanks.length === 1) {
    const quadRank = quadRanks[0];
    if (quadRank === undefined) {
      throw new Error("Four of a kind rank resolution failed");
    }

    const kicker = rankValues.find((rank) => rank !== quadRank);
    if (kicker === undefined) {
      throw new Error("Four of a kind kicker resolution failed");
    }

    return {
      category: "FOUR_OF_A_KIND",
      tiebreak: [quadRank, kicker]
    };
  }

  if (tripRanks.length === 1 && pairRanks.length === 1) {
    const tripRank = tripRanks[0];
    const pairRank = pairRanks[0];
    if (tripRank === undefined || pairRank === undefined) {
      throw new Error("Full house rank resolution failed");
    }

    return {
      category: "FULL_HOUSE",
      tiebreak: [tripRank, pairRank]
    };
  }

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

// This function evaluates a 7-card hand and determines the best possible 5-card hand category and tiebreak information, which is crucial for games like Texas Hold'em where players have 7 cards to choose from.
export function evaluate7(cards: Card[]): BestOfSevenEvaluation {
  if (cards.length !== 7) {
    throw new Error("evaluate7 requires exactly 7 cards");
  }
  assertNoDuplicateCards(cards);

  let best: BestOfSevenEvaluation | null = null;

  for (let a = 0; a <= 2; a += 1) {
    for (let b = a + 1; b <= 3; b += 1) {
      for (let c = b + 1; c <= 4; c += 1) {
        for (let d = c + 1; d <= 5; d += 1) {
          for (let e = d + 1; e <= 6; e += 1) {
            const chosen5 = [
              getCardAt(cards, a),
              getCardAt(cards, b),
              getCardAt(cards, c),
              getCardAt(cards, d),
              getCardAt(cards, e)
            ];
            const value = evaluate5(chosen5);
            const candidate: BestOfSevenEvaluation = {
              ...value,
              chosen5: orderChosen5(chosen5, value)
            };

            if (best === null || compareHandValues(candidate, best) > 0) {
              best = candidate;
            }
          }
        }
      }
    }
  }

  if (best === null) {
    throw new Error("Unable to evaluate best-of-7 hand");
  }

  return best;
}
