import type { Card } from "./card.js";
import { assertNoDuplicateCards, evaluate7, type BestOfSevenEvaluation } from "./hand-evaluator.js";
import { compareHandValues } from "./hand-comparator.js";

export type WinnersResult = {
  winnerIndexes: number[];
  playerResults: BestOfSevenEvaluation[];
  splitPot: boolean;
};

// Evaluates a Texas Hold'em hand given a 5-card board and 2 hole cards, returning the best 5-card hand evaluation
export function evaluateHoldemHand(board: Card[], hole: Card[]): BestOfSevenEvaluation {
  if (board.length !== 5) {
    throw new Error("Board must contain exactly 5 cards");
  }

  if (hole.length !== 2) {
    throw new Error("Hole cards must contain exactly 2 cards");
  }

  assertNoDuplicateCards([...board, ...hole]);
  return evaluate7([...board, ...hole]);
}

// Determines the winner(s) among multiple players given a 5-card board and each player's 2 hole cards, returning the indexes of the winning player(s) and their hand evaluations
export function determineWinners(board: Card[], playersHoles: Card[][]): WinnersResult {
  if (playersHoles.length === 0) {
    throw new Error("At least one player is required");
  }

  const allCards: Card[] = [...board];
  for (const holeCards of playersHoles) {
    allCards.push(...holeCards);
  }
  assertNoDuplicateCards(allCards);

  const playerResults = playersHoles.map((holeCards) => evaluateHoldemHand(board, holeCards));
  let bestHand = playerResults[0] as BestOfSevenEvaluation;

  const winnerIndexes = [0];

  for (let index = 1; index < playerResults.length; index += 1) {
    const hand = playerResults[index] as BestOfSevenEvaluation;

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
