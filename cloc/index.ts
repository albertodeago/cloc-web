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

const cloc = async function (dirHandle, results, dirBlackList, fileBlackList) {
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
        console.log(`file ${handleName} found`);
        const ext = getExtension(handleName);
        const fileContent = await getFileContent(fsHandle);
        const lines = fileContent.split("\n");

        const amounfPerExt = results.get(ext) || 0;
        results.set(ext, amounfPerExt + lines.length);
      } else {
        console.log(`file ${handleName} skipped`);
      }
    }
  }
};

const run = async function (dirHandle) {
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

  const results = new Map();

  await cloc(dirHandle, results, dirBlackList, fileBlackList);

  console.log("\n\nWork finished");
  for (const [ext, amount] of results) {
    console.log(`${ext}: ${amount}`);
  }
};

export default cloc;
export { run };
