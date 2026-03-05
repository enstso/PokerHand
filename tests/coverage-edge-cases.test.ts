import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { compareHandValues } from "../src/hand-comparator.js";
import { evaluate5, evaluate7, type HandEvaluation } from "../src/hand-evaluator.js";
import { determineWinners, evaluateHoldemHand } from "../src/holdem.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

describe("coverage edge cases", () => {
  it("compareHandValues handles different tiebreak vector lengths", () => {
    const shortHand: HandEvaluation = { category: "HIGH_CARD", tiebreak: [14] };
    const longHand: HandEvaluation = { category: "HIGH_CARD", tiebreak: [14, 2] };

    expect(compareHandValues(shortHand, longHand)).toBeLessThan(0);
    expect(compareHandValues(longHand, shortHand)).toBeGreaterThan(0);
  });

  it("evaluate5 rejects input that is not exactly 5 cards", () => {
    expect(() => evaluate5(cards(["AS", "KD", "QH", "JC"]))).toThrowError(
      "evaluate5 requires exactly 5 cards"
    );
  });

  it("evaluate7 rejects input that is not exactly 7 cards", () => {
    expect(() => evaluate7(cards(["AS", "KD", "QH", "JC", "TS", "9D"]))).toThrowError(
      "evaluate7 requires exactly 7 cards"
    );
  });

  it("evaluateHoldemHand validates board and hole sizes", () => {
    expect(() => evaluateHoldemHand(cards(["AS", "KD", "QH", "JC"]), cards(["TS", "9D"]))).toThrowError(
      "Board must contain exactly 5 cards"
    );
    expect(() => evaluateHoldemHand(cards(["AS", "KD", "QH", "JC", "TS"]), cards(["9D"]))).toThrowError(
      "Hole cards must contain exactly 2 cards"
    );
  });

  it("determineWinners rejects empty player list", () => {
    expect(() => determineWinners(cards(["AS", "KD", "QH", "JC", "TS"]), [])).toThrowError(
      "At least one player is required"
    );
  });

  it("determineWinners updates winner when a later player is stronger", () => {
    const board = cards(["2C", "5D", "7H", "9S", "JD"]);
    const playersHoles = [cards(["3C", "4D"]), cards(["AS", "AD"])];
    const result = determineWinners(board, playersHoles);

    expect(result.winnerIndexes).toEqual([1]);
    expect(result.splitPot).toBe(false);
  });
});
