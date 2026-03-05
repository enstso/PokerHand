import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluate5 } from "../src/hand-evaluator.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

describe("evaluate5 - three of a kind", () => {
  it("detects THREE_OF_A_KIND and returns trip rank then kickers", () => {
    const result = evaluate5(cards(["AS", "AD", "AH", "KC", "JS"]));

    expect(result.category).toBe("THREE_OF_A_KIND");
    expect(result.tiebreak).toEqual([14, 13, 11]);
  });

  it("orders kickers in descending order for three of a kind", () => {
    const result = evaluate5(cards(["7S", "7D", "7H", "2C", "QS"]));

    expect(result.category).toBe("THREE_OF_A_KIND");
    expect(result.tiebreak).toEqual([7, 12, 2]);
  });
});
