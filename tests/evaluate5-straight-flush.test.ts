import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluate5 } from "../src/hand-evaluator.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

describe("evaluate5 - straight flush", () => {
  it("detects STRAIGHT_FLUSH and returns straight high card", () => {
    const result = evaluate5(cards(["5H", "6H", "7H", "8H", "9H"]));

    expect(result.category).toBe("STRAIGHT_FLUSH");
    expect(result.tiebreak).toEqual([9]);
  });

  it("treats royal flush as the best straight flush (A-high)", () => {
    const result = evaluate5(cards(["TS", "JS", "QS", "KS", "AS"]));

    expect(result.category).toBe("STRAIGHT_FLUSH");
    expect(result.tiebreak).toEqual([14]);
  });
});
