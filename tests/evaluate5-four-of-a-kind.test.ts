import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluate5 } from "../src/hand-evaluator.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

describe("evaluate5 - four of a kind", () => {
  it("detects FOUR_OF_A_KIND and returns quad rank then kicker", () => {
    const result = evaluate5(cards(["AS", "AD", "AH", "AC", "KS"]));

    expect(result.category).toBe("FOUR_OF_A_KIND");
    expect(result.tiebreak).toEqual([14, 13]);
  });

  it("compares kicker after quad rank", () => {
    const result = evaluate5(cards(["7S", "7D", "7H", "7C", "2S"]));

    expect(result.category).toBe("FOUR_OF_A_KIND");
    expect(result.tiebreak).toEqual([7, 2]);
  });
});
