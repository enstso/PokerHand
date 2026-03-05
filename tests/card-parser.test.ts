import { describe, expect, it } from "vitest";
import { parseCard } from "../src/card";

describe("parseCard", () => {
  it("parses a valid card notation", () => {
    expect(parseCard("AS")).toEqual({ rank: "A", suit: "S" });
    expect(parseCard("TD")).toEqual({ rank: "T", suit: "D" });
  });

  it("rejects invalid rank", () => {
    expect(() => parseCard("1S")).toThrowError("Invalid rank");
    expect(() => parseCard("XS")).toThrowError("Invalid rank");
  });

  it("rejects invalid suit", () => {
    expect(() => parseCard("AZ")).toThrowError("Invalid suit");
    expect(() => parseCard("AQX")).toThrowError("Invalid format");
  });

  it("rejects invalid format", () => {
    expect(() => parseCard("")).toThrowError("Invalid format");
    expect(() => parseCard("A")).toThrowError("Invalid format");
    expect(() => parseCard("10S")).toThrowError("Invalid format");
  });
});
