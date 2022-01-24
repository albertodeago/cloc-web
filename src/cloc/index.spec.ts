import next from "next";
import { run } from ".";
import { logger } from "../utils";

const file1 = {
  kind: "file",
  name: "file1.js",
  getFile: async () => ({
    text: async () => "file 1 1 lines.",
  }),
};
const file2 = {
  kind: "file",
  name: "file2.ts",
  getFile: async () => ({
    text: async () => "file 2.\n2 lines",
  }),
};
const file3 = {
  kind: "file",
  name: "file3.md",
  getFile: async () => ({
    text: async () => "file 3.\n3 \nlines",
  }),
};
const file4 = {
  kind: "file",
  name: "file4.ts",
  getFile: async () => ({
    text: async () => "file\n 4.\n4 \nlines",
  }),
};
const dir1 = {
  kind: "directory",
  name: "dir1",
  entries: () => ({
    async *[Symbol.asyncIterator]() {
      yield [file1.name, file1];
      yield [file2.name, file2];
    },
  }),
};
const dir2 = {
  kind: "directory",
  name: "dir2",
  entries: () => ({
    async *[Symbol.asyncIterator]() {
      yield [file3.name, file3];
      yield [file4.name, file4];
    },
  }),
};

const dirHandle = {
  entries: () => ({
    async *[Symbol.asyncIterator]() {
      yield [dir1.name, dir1];
      yield [dir2.name, dir2];
    },
  }),
} as unknown as FileSystemDirectoryHandle;

describe("Run 'normal'", () => {
  it("should enable logging if asked", () => {
    jest.spyOn(logger, "setLogLevel");
    const dirHandle = {
      entries: () => {
        return [];
      },
    } as unknown as FileSystemDirectoryHandle;
    const fileIgnoreList: (string | RegExp)[] = [];
    const dirIgnoreList: (string | RegExp)[] = [];
    const isLogActive = true;
    run(dirHandle, fileIgnoreList, dirIgnoreList, isLogActive);
    expect(logger.setLogLevel).toHaveBeenCalledWith("info");
  });

  it("should skip (with string pattern matching) the directories in ignore list", async () => {
    const fileIgnoreList: (string | RegExp)[] = [];
    const dirIgnoreList: (string | RegExp)[] = ["ir1"];
    const isLogActive = false;
    const results = await run(
      dirHandle,
      fileIgnoreList,
      dirIgnoreList,
      isLogActive
    );
    expect(results.countedFiles).toBe(2);
    expect(results.cloc.get("md")).toBe(3);
    expect(results.cloc.get("ts")).toBe(4);
  });

  it("should skip (with RegExp matching) the directories in ignore list", async () => {
    const fileIgnoreList: (string | RegExp)[] = [];
    const dirIgnoreList: (string | RegExp)[] = [/.*2/];
    const isLogActive = false;
    const results = await run(
      dirHandle,
      fileIgnoreList,
      dirIgnoreList,
      isLogActive
    );
    expect(results.countedFiles).toBe(2);
    expect(results.cloc.get("js")).toBe(1);
    expect(results.cloc.get("ts")).toBe(2);
  });

  it("should skip (with string pattern matching) the files in ignore list", async () => {
    const fileIgnoreList: (string | RegExp)[] = ["file1"];
    const dirIgnoreList: (string | RegExp)[] = [];
    const isLogActive = false;
    const results = await run(
      dirHandle,
      fileIgnoreList,
      dirIgnoreList,
      isLogActive
    );
    expect(results.countedFiles).toBe(3);
    expect(results.cloc.get("js")).toBeUndefined();
    expect(results.cloc.get("md")).toBe(3);
    expect(results.cloc.get("ts")).toBe(6);
  });

  it("should skip (with RegExp matching) the files in ignore list", async () => {
    const fileIgnoreList: (string | RegExp)[] = [/ *.\.js/];
    const dirIgnoreList: (string | RegExp)[] = [];
    const isLogActive = false;
    const results = await run(
      dirHandle,
      fileIgnoreList,
      dirIgnoreList,
      isLogActive
    );
    expect(results.countedFiles).toBe(3);
    expect(results.cloc.get("js")).toBeUndefined();
    expect(results.cloc.get("md")).toBe(3);
    expect(results.cloc.get("ts")).toBe(6);
  });

  it("should count the number of lines of the found files", async () => {
    const fileIgnoreList: (string | RegExp)[] = [];
    const dirIgnoreList: (string | RegExp)[] = [];
    const isLogActive = false;
    const results = await run(
      dirHandle,
      fileIgnoreList,
      dirIgnoreList,
      isLogActive
    );
    expect(results.countedFiles).toBe(4);
    expect(results.cloc.get("js")).toBe(1);
    expect(results.cloc.get("md")).toBe(3);
    expect(results.cloc.get("ts")).toBe(6);
  });
});
