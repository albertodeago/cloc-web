import { getFileContent, getExtension } from "./utils";

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
      // self.requestIdleCallback(() => worker.terminate());
      worker.terminate();
    };
    worker.postMessage({
      cmd: "count-lines",
      payload: fileContent,
    });
  });
};

const cloc = async function (dirHandle, results, dirBlackList, fileBlackList) {
  for await (const [handleName, fsHandle] of dirHandle.entries()) {
    // console.log({ handleName, fsHandle });

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
        results.promises.push(awaitFromWorker(fileContent, ext));
      } else {
        // console.log(`file ${handleName} skipped`);
      }
    }
  }
};

const runWithLineCounters = async function (dirHandle) {
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
  delete results.promises;

  console.log("\n\nWork finished");
  for (const [ext, amount] of results.cloc) {
    console.log(`${ext}: ${amount}`);
  }

  return results;
};

export { runWithLineCounters };
