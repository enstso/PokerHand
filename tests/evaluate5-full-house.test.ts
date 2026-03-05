import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluate5 } from "../src/hand-evaluator.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

describe("evaluate5 - full house", () => {
  it("detects FULL_HOUSE and returns trip rank then pair rank", () => {
    const result = evaluate5(cards(["AS", "AD", "AH", "KC", "KS"]));

    expect(result.category).toBe("FULL_HOUSE");
    expect(result.tiebreak).toEqual([14, 13]);
  });

  it("keeps trip rank first in tiebreak regardless of card order", () => {
    const result = evaluate5(cards(["4S", "9D", "4H", "9S", "9C"]));

    expect(result.category).toBe("FULL_HOUSE");
    expect(result.tiebreak).toEqual([9, 4]);
  });
});
