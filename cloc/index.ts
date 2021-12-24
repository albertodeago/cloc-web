// import "wicg-file-system-access";
import { ClocResults } from "../types";
import { getExtension, getFileContent } from "./utils";

const cloc = async function (
  dirHandle: FileSystemDirectoryHandle,
  results: ClocResults,
  dirBlackList: Array<string>,
  fileBlackList: Array<string>
) {
  for await (const [handleName, fsHandle] of dirHandle.entries()) {
    // console.log({ handleName, fsHandle });

    if (fsHandle.kind === "directory") {
      if (!dirBlackList.includes(handleName)) {
        // console.log(`dir ${handleName} found`);
        await cloc(fsHandle, results, dirBlackList, fileBlackList);
      } else {
        // console.log(`dir ${handleName} skipped`);
      }
    } else {
      if (!fileBlackList.includes(handleName)) {
        // console.log(`file ${handleName} found`);
        results.countedFiles++;

        const ext = getExtension(handleName);
        const fileContent = await getFileContent(fsHandle);
        const lines = fileContent.split("\n");

        const amounfPerExt = results.cloc.get(ext) || 0;
        results.cloc.set(ext, amounfPerExt + lines.length);
      } else {
        // console.log(`file ${handleName} skipped`);
      }
    }
  }
};

const run = async function (
  dirHandle: FileSystemDirectoryHandle
): Promise<ClocResults> {
  // directories to ignore, usually these contains files that users don't want to count
  const dirBlackList = [
    ".svn",
    ".cvs",
    ".hg",
    ".git",
    ".bzr",
    ".snapshot",
    ".config",
    "node_modules",
  ];

  // files to ignore, usually these are files that users don't want to count
  const fileBlackList = ["package-lock.json", "yarn.lock", ".gitignore"];

  const results: ClocResults = {
    countedFiles: 0,
    cloc: new Map(),
  };

  await cloc(dirHandle, results, dirBlackList, fileBlackList);

  console.log("\n\nWork finished");
  for (const [ext, amount] of results.cloc) {
    console.log(`${ext}: ${amount}`);
  }

  return results;
};

export default cloc;
export { run };
