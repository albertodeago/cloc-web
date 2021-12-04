import { ClocResults } from "~~/types";

const getFileContent = async (fileHandle) => {
  const fileData = await fileHandle.getFile();
  const fileText = await fileData.text();
  return fileText;
};

const getExtension = (fileName) => {
  const splitName = fileName.split(".");
  if (splitName.length === 1 || splitName[0] === "") {
    return "no-extension";
  }

  const extension = splitName.pop();
  return extension;
};

const cloc = async function (
  dirHandle,
  results: ClocResults,
  dirBlackList: Array<string>,
  fileBlackList: Array<string>
) {
  for await (const [handleName, fsHandle] of dirHandle.entries()) {
    console.log({ handleName, fsHandle });

    if (fsHandle.kind === "directory") {
      if (!dirBlackList.includes(handleName)) {
        console.log(`dir ${handleName} found`);
        await cloc(fsHandle, results, dirBlackList, fileBlackList);
      } else {
        console.log(`dir ${handleName} skipped`);
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

const run = async function (dirHandle): Promise<ClocResults> {
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

  const results = {
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
