import { ClocResults } from "../types";
import { getExtension, getFileContent, logger } from "../utils";

const cloc = async function (
  dirHandle: FileSystemDirectoryHandle,
  results: ClocResults,
  dirBlackList: Array<string>,
  fileBlackList: Array<string>
) {
  for await (const [handleName, fsHandle] of dirHandle.entries()) {
    if (fsHandle.kind === "directory") {
      if (!dirBlackList.includes(handleName)) {
        logger.info(`Directory ${handleName} found`);
        await cloc(fsHandle, results, dirBlackList, fileBlackList);
      } else {
        logger.info(`Directory ${handleName} skipped`);
      }
    } else {
      if (!fileBlackList.includes(handleName)) {
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
  fileIgnoreList: string[],
  dirIgnoreList: string[],
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
