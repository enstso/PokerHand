import type { Card } from "./card.js";
import { evaluate7, type BestOfSevenEvaluation } from "./hand-evaluator.js";
import { compareHandValues } from "./hand-comparator.js";

export type WinnersResult = {
  winnerIndexes: number[];
  playerResults: BestOfSevenEvaluation[];
  splitPot: boolean;
};

export function evaluateHoldemHand(board: Card[], hole: Card[]): BestOfSevenEvaluation {
  if (board.length !== 5) {
    throw new Error("Board must contain exactly 5 cards");
  }

  if (hole.length !== 2) {
    throw new Error("Hole cards must contain exactly 2 cards");
  }

  return evaluate7([...board, ...hole]);
}

export function determineWinners(board: Card[], playersHoles: Card[][]): WinnersResult {
  if (playersHoles.length === 0) {
    throw new Error("At least one player is required");
  }

  const playerResults = playersHoles.map((holeCards) => evaluateHoldemHand(board, holeCards));
  let bestHand = playerResults[0];
  if (bestHand === undefined) {
    throw new Error("Unable to determine winner");
  }

  const winnerIndexes = [0];

  for (let index = 1; index < playerResults.length; index += 1) {
    const hand = playerResults[index];
    if (hand === undefined) {
      continue;
    }

    const comparison = compareHandValues(hand, bestHand);
    if (comparison > 0) {
      bestHand = hand;
      winnerIndexes.length = 0;
      winnerIndexes.push(index);
      continue;
    }

    if (comparison === 0) {
      winnerIndexes.push(index);
    }
  }

  return {
    winnerIndexes,
    playerResults,
    splitPot: winnerIndexes.length > 1
  };
}
