import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluate5 } from "../src/hand-evaluator.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

describe("evaluate5 - flush", () => {
  it("detects FLUSH and compares all five cards in descending rank order", () => {
    const result = evaluate5(cards(["AH", "JH", "9H", "6H", "4H"]));

    expect(result.category).toBe("FLUSH");
    expect(result.tiebreak).toEqual([14, 11, 9, 6, 4]);
  });

  it("keeps descending order regardless of input card order", () => {
    const result = evaluate5(cards(["2S", "TS", "5S", "KS", "8S"]));

    expect(result.category).toBe("FLUSH");
    expect(result.tiebreak).toEqual([13, 10, 8, 5, 2]);
  });
});
