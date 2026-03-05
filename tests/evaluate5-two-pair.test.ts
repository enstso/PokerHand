import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluate5 } from "../src/hand-evaluator.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

describe("evaluate5 - two pair", () => {
  it("detects TWO_PAIR and returns high pair, low pair, kicker", () => {
    const result = evaluate5(cards(["AS", "AD", "KH", "KC", "JS"]));

    expect(result.category).toBe("TWO_PAIR");
    expect(result.tiebreak).toEqual([14, 13, 11]);
  });

  it("orders pair ranks correctly regardless of card order", () => {
    const result = evaluate5(cards(["4S", "9D", "4H", "KS", "9C"]));

    expect(result.category).toBe("TWO_PAIR");
    expect(result.tiebreak).toEqual([9, 4, 13]);
  });
});
