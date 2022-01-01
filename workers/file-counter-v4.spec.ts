import { countLines } from "./file-counter-v4";

const fakeFileHandle = {
  getFile: () =>
    Promise.resolve({
      text: () => Promise.resolve("these\nare\nfour\nlines"),
    }),
} as FileSystemFileHandle;

describe("Worker: File Counter", () => {
  it("should count the lines of a file", async () => {
    const num = await countLines(fakeFileHandle);
    expect(num).toBe(4);
  });
});
