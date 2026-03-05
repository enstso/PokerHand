import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { determineWinners, evaluateHoldemHand } from "../src/holdem.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

function notationOf(card: { rank: string; suit: string }): string {
  return `${card.rank}${card.suit}`;
}

describe("integration - subject examples A to E", () => {
  it("example A: detects Ace-low straight (wheel)", () => {
    const board = cards(["AC", "2D", "3H", "4S", "9D"]);
    const hole = cards(["5C", "KD"]);
    const result = evaluateHoldemHand(board, hole);

    expect(result.category).toBe("STRAIGHT");
    expect(result.tiebreak).toEqual([5]);
    expect(result.chosen5.map(notationOf)).toEqual(["5C", "4S", "3H", "2D", "AC"]);
  });

  it("example B: detects Ace-high straight", () => {
    const board = cards(["TC", "JD", "QH", "KS", "2D"]);
    const hole = cards(["AC", "3D"]);
    const result = evaluateHoldemHand(board, hole);

    expect(result.category).toBe("STRAIGHT");
    expect(result.tiebreak).toEqual([14]);
    expect(result.chosen5.map(notationOf)).toEqual(["AC", "KS", "QH", "JD", "TC"]);
  });

  it("example C: flush keeps the best five suited cards", () => {
    const board = cards(["AH", "JH", "9H", "4H", "2H"]);
    const hole = cards(["6H", "KD"]);
    const result = evaluateHoldemHand(board, hole);

    expect(result.category).toBe("FLUSH");
    expect(result.tiebreak).toEqual([14, 11, 9, 6, 4]);
    expect(result.chosen5.map(notationOf)).toEqual(["AH", "JH", "9H", "6H", "4H"]);
  });

  it("example D: board plays tie / split", () => {
    const board = cards(["5C", "6D", "7H", "8S", "9D"]);
    const playersHoles = [cards(["AC", "AD"]), cards(["KC", "QD"])];
    const result = determineWinners(board, playersHoles);

    expect(result.winnerIndexes).toEqual([0, 1]);
    expect((result as { splitPot?: boolean }).splitPot).toBe(true);
    expect(result.playerResults[0]?.category).toBe("STRAIGHT");
    expect(result.playerResults[1]?.category).toBe("STRAIGHT");
    expect(result.playerResults[0]?.chosen5.map(notationOf)).toEqual(["9D", "8S", "7H", "6D", "5C"]);
    expect(result.playerResults[1]?.chosen5.map(notationOf)).toEqual(["9D", "8S", "7H", "6D", "5C"]);
  });

  it("example E: quads on board, kicker decides winner", () => {
    const board = cards(["7C", "7D", "7H", "7S", "2D"]);
    const playersHoles = [cards(["AC", "KC"]), cards(["QC", "JC"])];
    const result = determineWinners(board, playersHoles);

    expect(result.winnerIndexes).toEqual([0]);
    expect((result as { splitPot?: boolean }).splitPot).toBe(false);
    expect(result.playerResults[0]?.category).toBe("FOUR_OF_A_KIND");
    expect(result.playerResults[1]?.category).toBe("FOUR_OF_A_KIND");
    expect(result.playerResults[0]?.tiebreak).toEqual([7, 14]);
    expect(result.playerResults[1]?.tiebreak).toEqual([7, 12]);
  });
});
