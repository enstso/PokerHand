import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { evaluate7 } from "../src/hand-evaluator.js";
import { determineWinners, evaluateHoldemHand } from "../src/holdem.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

describe("duplicate card validation", () => {
  it("rejects duplicate cards in evaluate7 input", () => {
    const duplicated = cards(["AS", "KD", "QH", "JC", "TS", "AS", "2D"]);

    expect(() => evaluate7(duplicated)).toThrowError("Duplicate card");
  });

  it("rejects duplicate cards between board and hole cards", () => {
    const board = cards(["AS", "KD", "QH", "JC", "TS"]);
    const hole = cards(["AS", "2D"]);

    expect(() => evaluateHoldemHand(board, hole)).toThrowError("Duplicate card");
  });

  it("rejects duplicate cards across multiple players", () => {
    const board = cards(["5C", "6D", "7H", "8S", "9D"]);
    const playersHoles = [cards(["AC", "AD"]), cards(["AC", "QD"])];

    expect(() => determineWinners(board, playersHoles)).toThrowError("Duplicate card");
  });
});
