import { describe, expect, it } from "vitest";
import { parseCard} from "../src/card.js";
import { evaluate5 } from "../src/hand-evaluator.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

describe("evaluate5 - high card", () => {
  it("returns HIGH_CARD with descending tiebreak vector", () => {
    const result = evaluate5(cards(["AS", "5D", "KH", "8C", "JS"]));

    expect(result.category).toBe("HIGH_CARD");
    expect(result.tiebreak).toEqual([14, 13, 11, 8, 5]);
  });

  it("keeps all five ranks in the ordered vector", () => {
    const result = evaluate5(cards(["AH", "KD", "JC", "8S", "4H"]));

    expect(result.category).toBe("HIGH_CARD");
    expect(result.tiebreak).toHaveLength(5);
    expect(result.tiebreak).toEqual([14, 13, 11, 8, 4]);
  });
});
