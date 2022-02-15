import { compare, getFileContent, getExtension, Deferred } from ".";

describe("Utils", () => {
  describe("compare", () => {
    it("should return 1 if a is less than b", () => {
      const a: [string, string, number] = ["a", "a", 1];
      const b: [string, string, number] = ["b", "b", 2];
      expect(compare(a, b)).toBe(1);
    });

    it("should return -1 if a is greater than b", () => {
      const a: [string, string, number] = ["b", "b", 2];
      const b: [string, string, number] = ["a", "a", 1];
      expect(compare(a, b)).toBe(-1);
    });

    it("should return 0 if a is equal to b", () => {
      const a: [string, string, number] = ["a", "a", 1];
      const b: [string, string, number] = ["a", "a", 1];
      expect(compare(a, b)).toBe(0);
    });

    it("should sort arrays of tuple in descendant mode", () => {
      const a: Array<[string, string, number]> = [
        ["rs", "rust", 1],
        ["ts", "typescript", 1000],
        ["js", "javascript", 10],
        ["md", "markdown", 50],
      ];
      const sorted = a.sort(compare);
      expect(sorted[0][2]).toBe(1000);
      expect(sorted[1][2]).toBe(50);
      expect(sorted[2][2]).toBe(10);
      expect(sorted[3][2]).toBe(1);
    });
  });

  describe("getFileContent", () => {
    it("should return the text given a fileHandle", async () => {
      // Create a "fake fileHandle" to test the function
      const fileHandle = {
        getFile: () =>
          Promise.resolve({
            text: () => Promise.resolve("test"),
          }),
      } as FileSystemFileHandle;
      const fileText = await getFileContent(fileHandle);
      expect(fileText).toBe("test");
    });
  });

  describe("getExtension", () => {
    it("should return the extension of a file", () => {
      expect(getExtension("test.md")).toBe("md");
      expect(getExtension("test.worker.js")).toBe("js");
    });
    it("should return 'no-extension' when the file has no extension", () => {
      expect(getExtension("test")).toBe("NO-EXTENSION");
    });
  });

  describe("Deferred", () => {
    it("should resolve a promise", async () => {
      const deferred = new Deferred<string>();
      deferred.resolve("test");
      const result = await deferred.promise;
      expect(result).toBe("test");
    });

    it("should reject a promise", async () => {
      const deferred = new Deferred<string>();
      deferred.reject("test");
      try {
        await deferred.promise;
      } catch (e) {
        expect(e).toBe("test");
      }
    });
  });
});
