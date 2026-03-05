import type { Card } from "./card.js";
import { evaluate7, type BestOfSevenEvaluation } from "./hand-evaluator.js";

export function evaluateHoldemHand(board: Card[], hole: Card[]): BestOfSevenEvaluation {
  if (board.length !== 5) {
    throw new Error("Board must contain exactly 5 cards");
  }

  if (hole.length !== 2) {
    throw new Error("Hole cards must contain exactly 2 cards");
  }

  return evaluate7([...board, ...hole]);
}
