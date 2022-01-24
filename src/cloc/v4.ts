import { ClocResults } from "../types";
import { logger } from "../utils";
import { shouldBeIgnored } from "./ignoreList";

type WorkerPoolItem = {
  id: number;
  worker: Worker;
};
let workerPool: Array<WorkerPoolItem> = [];
let maxWorkers: number;
let workerId: number;

let filesToCount: number;
const results: ClocResults = {
  countedFiles: 0,
  cloc: new Map(),
};

let counter: number;
let firstRun: boolean;
const firstDelay = 350;

/**
 * set/reset values at the initial stage. This must be done before
 * starting to count files
 */
const initValues = (numOfWorkers: number) => {
  // reset workers
  workerPool.forEach((item) => item.worker.terminate());
  workerPool = [];
  maxWorkers = numOfWorkers;
  workerId = 0;

  // reset values for results
  filesToCount = 0;
  results.countedFiles = 0;
  results.cloc.clear();

  // reset stuff for the sendMessage function
  counter = 0;
  firstRun = false;
};

/**
 * Create the workers and set listeners
 */
const createWorkers = () => {
  logger.info(`Creating ${maxWorkers} workers`);
  while (workerPool.length < maxWorkers) {
    const worker = new Worker(
      new URL("../workers/file-counter-v4.ts", import.meta.url)
    );
    workerPool.push({
      id: workerId,
      worker,
    });

    worker.onmessage = (e) => {
      const { id, ext, lines } = e.data.payload;
      logger.info(`Worker ${id} finished counting ${ext}. ${lines} lines`);

      const currentVal = results.cloc.get(ext) || 0;
      results.cloc.set(ext, currentVal + lines);
      results.countedFiles++;

      if (results.countedFiles === filesToCount) {
        logger.info(
          `\nAll ${filesToCount} files have been counted, returning results to main thread`
        );

        const msgv4 = {
          cmd: "cloc-response",
          payload: results,
        };
        self.postMessage(msgv4);
      }
    };

    workerId++;
  }
};

/**
 * Send a message to a workers.
 * The workers is choseen in a round robin fashion.
 */
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
  dirBlackList: (string | RegExp)[],
  fileBlackList: (string | RegExp)[]
) {
  for await (const [handleName, fsHandle] of dirHandle.entries()) {
    if (fsHandle.kind === "directory") {
      if (!shouldBeIgnored(dirBlackList, handleName)) {
        logger.info(`Directory ${handleName} found`);
        await cloc(fsHandle, results, dirBlackList, fileBlackList);
      } else {
        logger.info(`Directory ${handleName} skipped`);
      }
    } else {
      if (!shouldBeIgnored(fileBlackList, handleName)) {
        logger.info(`File ${handleName} found`);
        filesToCount++;
        sendMessage(handleName, fsHandle);
      } else {
        logger.info(`File ${handleName} skipped`);
      }
    }
  }
};

const v4 = async function (
  dirHandle: FileSystemDirectoryHandle,
  numOfWorkers: number,
  fileIgnoreList: (string | RegExp)[],
  dirIgnoreList: (string | RegExp)[],
  isLogActive: boolean
) {
  logger.setLogLevel(isLogActive ? "info" : "error");
  initValues(numOfWorkers);
  createWorkers();

  await cloc(dirHandle, results, dirIgnoreList, fileIgnoreList);

  logger.info("All messages sent to other workers, now waiting for results");
};

export { v4 };
