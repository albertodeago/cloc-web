import { ClocResults } from "../types";

type WorkerPoolItem = {
  id: number;
  status: "free";
  worker: Worker;
};
const workerPool: Array<WorkerPoolItem> = [];
const maxWorkers = 15;
let workerId = 0;

let filesToCount = 0;
const results: ClocResults = {
  countedFiles: 0,
  cloc: new Map(),
};

while (workerPool.length < maxWorkers) {
  const worker = new Worker(
    new URL("../workers/file-counter-v4.ts", import.meta.url)
  );
  workerPool.push({
    id: workerId,
    status: "free",
    worker,
  });

  worker.onmessage = (e) => {
    const { id, ext, lines } = e.data.payload;

    const currentVal = results.cloc.get(ext) || 0;
    results.cloc.set(ext, currentVal + lines);
    results.countedFiles++;

    // console.log(
    //   "Worker " +
    //     id +
    //     " counted a file [" +
    //     ext +
    //     "]: " +
    //     lines +
    //     ". Still need to count " +
    //     (filesToCount - results.countedFiles)
    // );

    if (results.countedFiles === filesToCount) {
      console.log("\nAll files counted");
      console.log(results);

      const msgv4 = {
        cmd: "cloc-response",
        payload: results,
      };
      self.postMessage(msgv4);
    }
  };

  workerId++;
}

let counter = 0;
let firstRun = false;
const firstDelay = 350;
const sendMessage = async function (
  handleName: string,
  fsHandle: FileSystemFileHandle
) {
  const { id, worker } = workerPool[counter];
  counter = (counter + 1) % maxWorkers;

  const run = (fileName: string, fileHandle: FileSystemFileHandle) => {
    worker.postMessage({
      cmd: "count-files",
      id,
      fileName,
      fileHandle,
    });
  };

  if (firstRun) {
    setTimeout(() => {
      run(handleName, fsHandle);
    }, firstDelay);
  } else {
    firstRun = true;
    run(handleName, fsHandle);
  }
};

const cloc = async function (
  dirHandle: FileSystemDirectoryHandle,
  results: ClocResults,
  dirBlackList: Array<string>,
  fileBlackList: Array<string>
) {
  for await (const [handleName, fsHandle] of dirHandle.entries()) {
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
        filesToCount++;
        sendMessage(handleName, fsHandle);
      } else {
        // console.log(`file ${handleName} skipped`);
      }
    }
  }
};

const v4 = async function (dirHandle: FileSystemDirectoryHandle) {
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

  await cloc(dirHandle, results, dirBlackList, fileBlackList);

  console.log("\nAll messages sent, now waiting for workers");
};

export { v4 };
