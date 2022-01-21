import { ClocResults } from "../types";
import { getFileContent, getExtension, logger } from "../utils";

interface ClocResultsWithPromises extends ClocResults {
  promises: Array<Promise<{ ext: string; lines: number }>>;
}

const awaitFromWorker = function (
  fileContent: string,
  ext: string
): Promise<{ ext: string; lines: number }> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../workers/line-counter.ts", import.meta.url)
    );
    worker.onmessage = function (e) {
      resolve({
        ext,
        lines: e.data.payload,
      });
      // terminate the worker when it's done
      worker.terminate();
    };
    worker.postMessage({
      cmd: "count-lines",
      payload: fileContent,
    });
  });
};

const cloc = async function (
  dirHandle: FileSystemDirectoryHandle,
  results: ClocResultsWithPromises,
  dirBlackList: Array<string>,
  fileBlackList: Array<string>
) {
  for await (const [handleName, fsHandle] of dirHandle.entries()) {
    // console.log({ handleName, fsHandle });

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
        results.promises.push(awaitFromWorker(fileContent, ext));
      } else {
        logger.info(`File ${handleName} skipped`);
      }
    }
  }
};

const runWithLineCounters = async function (
  dirHandle: FileSystemDirectoryHandle
) {
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
    promises: [],
  };

  await cloc(dirHandle, results, dirBlackList, fileBlackList);
  const res = await Promise.all(results.promises);
  res.forEach(({ ext, lines }) => {
    const amounfPerExt = results.cloc.get(ext) || 0;
    results.cloc.set(ext, amounfPerExt + lines);
  });
  const realResults: ClocResults = {
    countedFiles: results.countedFiles,
    cloc: results.cloc,
  };

  // console.log("\n\nWork finished");
  // for (const [ext, amount] of realResults.cloc) {
  //   console.log(`${ext}: ${amount}`);
  // }

  return realResults;
};

export { runWithLineCounters };
