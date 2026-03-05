import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluate5 } from "../src/hand-evaluator.js";
import { compareHandValues } from "../src/hand-comparator.js";

function evaluate(notationList: string[]) {
  return evaluate5(notationList.map(parseCard));
}

describe("compareHandValues", () => {
  it("orders all categories from strongest to weakest", () => {
    const orderedHands = [
      evaluate(["9S", "TS", "JS", "QS", "KS"]), // straight flush
      evaluate(["AS", "AD", "AH", "AC", "2D"]), // four of a kind
      evaluate(["KS", "KD", "KH", "2C", "2D"]), // full house
      evaluate(["AH", "JH", "9H", "6H", "2H"]), // flush
      evaluate(["5S", "6D", "7H", "8C", "9S"]), // straight
      evaluate(["QS", "QD", "QH", "9C", "2D"]), // three of a kind
      evaluate(["JS", "JD", "4H", "4C", "2S"]), // two pair
      evaluate(["TS", "TD", "9H", "7C", "2D"]), // one pair
      evaluate(["AS", "KD", "JH", "8C", "3D"]) // high card
    ];

    for (let index = 0; index < orderedHands.length - 1; index += 1) {
      const stronger = orderedHands[index];
      const weaker = orderedHands[index + 1];
      if (stronger === undefined || weaker === undefined) {
        throw new Error("Unexpected missing hand in ordered list");
      }

      expect(compareHandValues(stronger, weaker)).toBeGreaterThan(0);
      expect(compareHandValues(weaker, stronger)).toBeLessThan(0);
    }
  });

  it("uses tiebreak vectors when categories are equal", () => {
    const pairOfAces = evaluate(["AS", "AD", "9H", "7C", "2D"]);
    const pairOfKings = evaluate(["KS", "KD", "QH", "8C", "3D"]);

    expect(compareHandValues(pairOfAces, pairOfKings)).toBeGreaterThan(0);
    expect(compareHandValues(pairOfKings, pairOfAces)).toBeLessThan(0);
  });

  it("returns 0 when hands are exactly tied", () => {
    const left = evaluate(["AS", "KD", "JH", "8C", "3D"]);
    const right = evaluate(["AH", "KC", "JD", "8S", "3C"]);

    expect(compareHandValues(left, right)).toBe(0);
    expect(compareHandValues(right, left)).toBe(0);
  });
});
