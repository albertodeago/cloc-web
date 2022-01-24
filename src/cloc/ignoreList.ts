export type IgnoreEntry = string | RegExp;

export const fileDefaultIgnoreList: IgnoreEntry[] = [
  "package-lock.json",
  /.*\.lock/,
  ".gitignore",
  "code-search",
  "github-issues",
];

export const dirDefaultIgnoreList: IgnoreEntry[] = [
  ".svn",
  ".cvs",
  ".hg",
  ".git",
  ".bzr",
  ".snapshot",
  ".config",
  "node_modules",
];

export const shouldBeIgnored = (
  patternList: IgnoreEntry[],
  str: string
): boolean => {
  return !!patternList.find((pattern) =>
    typeof pattern === "string"
      ? str.indexOf(pattern) !== -1
      : pattern.test(str)
  );
};
