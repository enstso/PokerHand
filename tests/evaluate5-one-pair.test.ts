import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluate5 } from "../src/hand-evaluator.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

describe("evaluate5 - one pair", () => {
  it("detects ONE_PAIR and returns pair rank then kickers", () => {
    const result = evaluate5(cards(["AS", "AD", "KH", "8C", "JS"]));

    expect(result.category).toBe("ONE_PAIR");
    expect(result.tiebreak).toEqual([14, 13, 11, 8]);
  });

  it("orders kickers in descending order for one pair", () => {
    const result = evaluate5(cards(["9S", "9D", "2H", "KC", "JS"]));

    expect(result.category).toBe("ONE_PAIR");
    expect(result.tiebreak).toEqual([9, 13, 11, 2]);
  });
});
