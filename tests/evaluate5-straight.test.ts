import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluate5 } from "../src/hand-evaluator.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

describe("evaluate5 - straight", () => {
  it("detects Ace-high straight", () => {
    const result = evaluate5(cards(["TS", "JD", "QH", "KC", "AS"]));

    expect(result.category).toBe("STRAIGHT");
    expect(result.tiebreak).toEqual([14]);
  });

  it("detects Ace-low straight (wheel)", () => {
    const result = evaluate5(cards(["AS", "2D", "3H", "4C", "5S"]));

    expect(result.category).toBe("STRAIGHT");
    expect(result.tiebreak).toEqual([5]);
  });

  it("does not allow wrap-around straight (Q-K-A-2-3)", () => {
    const result = evaluate5(cards(["QS", "KD", "AH", "2C", "3S"]));

    expect(result.category).toBe("HIGH_CARD");
    expect(result.tiebreak).toEqual([14, 13, 12, 3, 2]);
  });
});
