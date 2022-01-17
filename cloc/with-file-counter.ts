import { ClocResults } from "../types";
import { getExtension, Deferred, logger } from "../utils";

interface ClocResultsWithPromises extends ClocResults {
  promises: Array<Promise<{ ext: string; lines: number }>>;
}

type WorkerPoolItem = {
  id: number;
  status: "free" | "busy";
  def: Deferred<WorkerPoolItem>;
  worker: Worker;
};
let workerPool: Array<WorkerPoolItem> = [];
let maxWorkers: number;
let workerId: number;

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
};

const createWorkers = () => {
  logger.info(`Creating ${maxWorkers} workers`);
  while (workerPool.length < maxWorkers) {
    const worker = new Worker(
      new URL("../workers/file-counter.ts", import.meta.url)
    );
    workerPool.push({
      id: workerId,
      worker,
      status: "free",
      def: new Deferred(),
    });
    workerId++;
  }
};

const getFreeWorker = async function (): Promise<{
  worker: Worker;
  id: number;
  status: "free" | "busy";
  def: any;
}> {
  return new Promise(async (resolve) => {
    let obj = workerPool.find((obj) => obj.status === "free");
    if (!obj) {
      // const randomId = Math.floor(Math.random() * maxWorkers);
      // console.log("waiting for worker " + randomId);
      // obj = workerPool[randomId];
      // await obj.def.promise;
      // console.log("worker " + randomId + " freed");

      // console.log("waiting for a free worker...");
      let status;
      do {
        obj = await Promise.race(workerPool.map((a) => a.def.promise));
        status = obj.status;
      } while (status !== "free");
      // console.log("worker " + obj.id + " free. " + obj.status);
    }
    obj.status = "busy";
    obj.def = new Deferred();

    resolve(obj);
  });
};

const pollForWorker = (resolve: Function) => {
  let obj = workerPool.find((obj) => obj.status === "free");
  if (!obj) {
    setTimeout(() => pollForWorker(resolve), 25);
  } else {
    obj.status = "busy";
    obj.def = new Deferred();
    resolve(obj);
  }
};
const getFreeWorkerPolling = function (): Promise<{
  worker: Worker;
  id: number;
  status: "free" | "busy";
  def: any;
}> {
  return new Promise((resolve) => {
    pollForWorker(resolve);
  });
};

const awaitFromWorker = async function (
  fsHandle: any,
  ext: string
): Promise<{ ext: string; lines: number }> {
  return new Promise(async (resolve) => {
    // const obj = await getFreeWorker();
    const obj = await getFreeWorkerPolling();
    obj.worker.onmessage = function (e) {
      logger.info(`[Worker${obj.id}] counted ${e.data.payload} lines`);
      resolve({
        ext,
        lines: e.data.payload,
      });
      obj.status = "free";
      obj.def.resolve(obj);
    };
    obj.worker.postMessage({
      cmd: "count-files",
      payload: fsHandle,
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
        results.promises.push(awaitFromWorker(fsHandle, ext));
      } else {
        logger.info(`File ${handleName} skipped`);
      }
    }
  }
};

const runWithFileCounters = async function (
  dirHandle: FileSystemDirectoryHandle,
  numOfWorkers: number,
  dirBlackList: Array<string>,
  fileBlackList: Array<string>,
  isLogActive: boolean
) {
  logger.setLogLevel(isLogActive ? "info" : "error");
  initValues(numOfWorkers);
  createWorkers();

  const results: ClocResultsWithPromises = {
    countedFiles: 0,
    cloc: new Map(),
    promises: [],
  };

  await cloc(dirHandle, results, dirBlackList, fileBlackList);
  logger.info("All file scanned, now waiting for workers to finish");
  const res = await Promise.all(results.promises);
  res.forEach(({ ext, lines }) => {
    const amounfPerExt = results.cloc.get(ext) || 0;
    results.cloc.set(ext, amounfPerExt + lines);
  });
  const realResults: ClocResults = {
    countedFiles: results.countedFiles,
    cloc: results.cloc,
  };

  // for (const [ext, amount] of realResults.cloc) {
  //   console.log(`${ext}: ${amount}`);
  // }

  return realResults;
};

export { runWithFileCounters };
