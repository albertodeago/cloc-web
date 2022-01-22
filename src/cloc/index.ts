import { ClocResults } from "../types";
import { getExtension, getFileContent, logger } from "../utils";

/**
 * Return true if the str match against any of the pattern (with regex)
 */
const isBlackListed = (
  patternList: (string | RegExp)[],
  str: string
): boolean =>
  !!patternList.find((pattern) =>
    typeof pattern === "string"
      ? str.indexOf(pattern) !== -1
      : new RegExp(pattern).test(str)
  );

const cloc = async function (
  dirHandle: FileSystemDirectoryHandle,
  results: ClocResults,
  dirBlackList: (string | RegExp)[],
  fileBlackList: (string | RegExp)[]
) {
  for await (const [handleName, fsHandle] of dirHandle.entries()) {
    if (fsHandle.kind === "directory") {
      if (!isBlackListed(dirBlackList, handleName)) {
        logger.info(`Directory ${handleName} found`);
        await cloc(fsHandle, results, dirBlackList, fileBlackList);
      } else {
        logger.info(`Directory ${handleName} skipped`);
      }
    } else {
      if (!isBlackListed(fileBlackList, handleName)) {
        logger.info(`File ${handleName} found`);
        results.countedFiles++;

        const ext = getExtension(handleName);
        const fileContent = await getFileContent(fsHandle);
        const lines = fileContent.split("\n");

        const amounfPerExt = results.cloc.get(ext) || 0;
        results.cloc.set(ext, amounfPerExt + lines.length);
      } else {
        logger.info(`File ${handleName} skipped`);
      }
    }
  }
};

const run = async function (
  dirHandle: FileSystemDirectoryHandle,
  fileIgnoreList: (string | RegExp)[],
  dirIgnoreList: (string | RegExp)[],
  isLogActive: boolean
): Promise<ClocResults> {
  logger.setLogLevel(isLogActive ? "info" : "error");

  const results: ClocResults = {
    countedFiles: 0,
    cloc: new Map(),
  };

  await cloc(dirHandle, results, dirIgnoreList, fileIgnoreList);

  return results;
};

export default cloc;
export { run };
