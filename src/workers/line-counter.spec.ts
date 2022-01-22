import { countLines } from "./line-counter";

describe("Worker: Line Counter", () => {
  it("should count the lines of a given string", () => {
    expect(countLines("these\nare\nfour\nlines")).toBe(4);
  });
});
