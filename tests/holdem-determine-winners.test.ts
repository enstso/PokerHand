import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card.js";
import { determineWinners } from "../src/holdem.js";

function cards(notationList: string[]) {
  return notationList.map(parseCard);
}

describe("determineWinners", () => {
  it("returns a single winner when one player has the best hand", () => {
    const board = cards(["7C", "7D", "7H", "7S", "2D"]);
    const playersHoles = [cards(["AC", "KC"]), cards(["QC", "JC"])];
    const result = determineWinners(board, playersHoles);

    expect(result.winnerIndexes).toEqual([0]);
    expect(result.playerResults).toHaveLength(2);
    expect(result.playerResults[0]?.category).toBe("FOUR_OF_A_KIND");
    expect(result.playerResults[1]?.category).toBe("FOUR_OF_A_KIND");
  });

  it("returns multiple winners when players tie (split pot)", () => {
    const board = cards(["5C", "6D", "7H", "8S", "9D"]);
    const playersHoles = [cards(["AC", "AD"]), cards(["KC", "QD"]), cards(["2C", "2H"])];
    const result = determineWinners(board, playersHoles);

    expect(result.winnerIndexes).toEqual([0, 1, 2]);
    expect(result.playerResults).toHaveLength(3);
    expect(result.playerResults.every((hand) => hand.category === "STRAIGHT")).toBe(true);
  });
});
