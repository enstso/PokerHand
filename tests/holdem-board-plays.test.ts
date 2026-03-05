import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluateHoldemHand } from "../src/holdem.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

function notationOf(card: { rank: string; suit: string }): string {
  return `${card.rank}${card.suit}`;
}

function countUsedHoleCards(
  chosen5: Array<{ rank: string; suit: string }>,
  hole: Array<{ rank: string; suit: string }>
) {
  const holeNotations = new Set(hole.map(notationOf));
  return chosen5.filter((card) => holeNotations.has(notationOf(card))).length;
}

describe("evaluateHoldemHand - board plays", () => {
  it("supports board plays (0 hole cards used)", () => {
    const board = cards(["5C", "6D", "7H", "8S", "9D"]);
    const hole = cards(["AC", "AD"]);
    const result = evaluateHoldemHand(board, hole);

    expect(result.category).toBe("STRAIGHT");
    expect(result.tiebreak).toEqual([9]);
    expect(countUsedHoleCards(result.chosen5, hole)).toBe(0);
  });

  it("supports best hand using exactly 1 hole card", () => {
    const board = cards(["AH", "JH", "9H", "4H", "2C"]);
    const hole = cards(["6H", "KD"]);
    const result = evaluateHoldemHand(board, hole);

    expect(result.category).toBe("FLUSH");
    expect(result.tiebreak).toEqual([14, 11, 9, 6, 4]);
    expect(countUsedHoleCards(result.chosen5, hole)).toBe(1);
  });

  it("supports best hand using exactly 2 hole cards", () => {
    const board = cards(["AC", "KD", "QH", "2S", "7D"]);
    const hole = cards(["JC", "TD"]);
    const result = evaluateHoldemHand(board, hole);

    expect(result.category).toBe("STRAIGHT");
    expect(result.tiebreak).toEqual([14]);
    expect(countUsedHoleCards(result.chosen5, hole)).toBe(2);
  });
});
