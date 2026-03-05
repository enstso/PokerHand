import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluate7 } from "../src/hand-evaluator.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

function notationOf(card: { rank: string; suit: string }): string {
  return `${card.rank}${card.suit}`;
}

describe("evaluate7 - best of 7", () => {
  it("picks the strongest 5-card hand available from 7 cards", () => {
    const available = cards(["AS", "KS", "QS", "JS", "TS", "2D", "3C"]);
    const result = evaluate7(available);

    expect(result.category).toBe("STRAIGHT_FLUSH");
    expect(result.tiebreak).toEqual([14]);
    expect(result.chosen5.map(notationOf).sort()).toEqual(["AS", "KS", "QS", "JS", "TS"].sort());
  });

  it("returns chosen5 as exactly 5 distinct cards, all from the 7 available", () => {
    const available = cards(["AH", "KH", "QH", "9H", "4H", "2H", "AS"]);
    const availableNotations = available.map(notationOf);
    const result = evaluate7(available);
    const chosenNotations = result.chosen5.map(notationOf);

    expect(result.category).toBe("FLUSH");
    expect(result.tiebreak).toEqual([14, 13, 12, 9, 4]);
    expect(result.chosen5).toHaveLength(5);
    expect(new Set(chosenNotations).size).toBe(5);

    for (const notation of chosenNotations) {
      expect(availableNotations).toContain(notation);
    }
  });
});
