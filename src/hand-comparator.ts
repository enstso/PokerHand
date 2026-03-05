import type { HandCategory, HandEvaluation } from "./hand-evaluator.js";

const CATEGORY_STRENGTH: Record<HandCategory, number> = {
  HIGH_CARD: 0,
  ONE_PAIR: 1,
  TWO_PAIR: 2,
  THREE_OF_A_KIND: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  FOUR_OF_A_KIND: 7,
  STRAIGHT_FLUSH: 8
};

// Returns a positive number if left is stronger, negative if right is stronger, or 0 if they are equal
export function compareHandValues(left: HandEvaluation, right: HandEvaluation): number {
  const categoryDiff = CATEGORY_STRENGTH[left.category] - CATEGORY_STRENGTH[right.category];
  if (categoryDiff !== 0) {
    return categoryDiff;
  }

  const maxLength = Math.max(left.tiebreak.length, right.tiebreak.length);
  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = left.tiebreak[index] ?? -1;
    const rightValue = right.tiebreak[index] ?? -1;

    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  return 0;
}
