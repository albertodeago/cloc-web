import { shouldBeIgnored } from "./ignoreList";

describe("shouldBeIgnore", () => {
  it("should ignore if pattern is a string", () => {
    const patternList = ["foo", "bar"];
    const str1 = "foo";
    const str2 = "this is a long and bar string";
    const str3 = "this is another long string";
    expect(shouldBeIgnored(patternList, str1)).toBe(true);
    expect(shouldBeIgnored(patternList, str2)).toBe(true);
    expect(shouldBeIgnored(patternList, str3)).toBe(false);
  });

  it("should ignore if pattern is a RegExp", () => {
    const patternList = [/foo/, /.*\.js/];
    const str1 = "this is a long and foo string";
    const str2 = "file javascript.js";
    const str3 = "file javascript.ts";
    expect(shouldBeIgnored(patternList, str1)).toBe(true);
    expect(shouldBeIgnored(patternList, str2)).toBe(true);
    expect(shouldBeIgnored(patternList, str3)).toBe(false);
  });
});
