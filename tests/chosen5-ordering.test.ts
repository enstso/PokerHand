import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluate7 } from "../src/hand-evaluator.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

function notationOf(card: { rank: string; suit: string }): string {
  return `${card.rank}${card.suit}`;
}

describe("chosen5 deterministic ordering", () => {
  it("orders straight chosen5 from high to low (wheel as 5,4,3,2,A)", () => {
    const result = evaluate7(cards(["AC", "2D", "3H", "4S", "5C", "KD", "QH"]));

    expect(result.category).toBe("STRAIGHT");
    expect(result.chosen5.map(notationOf)).toEqual(["5C", "4S", "3H", "2D", "AC"]);
  });

  it("orders four of a kind chosen5 as quads first then kicker", () => {
    const result = evaluate7(cards(["9H", "KS", "2D", "KD", "KH", "3C", "KC"]));

    expect(result.category).toBe("FOUR_OF_A_KIND");
    expect(result.chosen5.map(notationOf)).toEqual(["KS", "KD", "KH", "KC", "9H"]);
  });

  it("orders two pair chosen5 as high pair, low pair, then kicker", () => {
    const result = evaluate7(cards(["4S", "9D", "4H", "KS", "9C", "2D", "AH"]));

    expect(result.category).toBe("TWO_PAIR");
    expect(result.chosen5.map(notationOf)).toEqual(["9D", "9C", "4S", "4H", "AH"]);
  });
});
