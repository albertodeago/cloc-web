import { ClocResults } from "../types";
import { getExtension } from "../utils";

interface ClocResultsWithPromises extends ClocResults {
  promises: Array<Promise<{ ext: string; lines: number }>>;
}

class Deferred<T> {
  public promise: Promise<T>;

  // @ts-ignore-line
  private _resolve: Function;
  // @ts-ignore-line
  private _reject: Function;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  resolve(value?: any) {
    this._resolve(value);
  }

  reject(reason?: any) {
    this._reject(reason);
  }
}

// Deferred.Promise = Promise;

type WorkerPoolItem = {
  id: number;
  status: "free" | "busy";
  def: Deferred<WorkerPoolItem>;
  worker: Worker;
};
const workerPool: Array<WorkerPoolItem> = [];
const maxWorkers = 15;
let workerId = 0;

while (workerPool.length < maxWorkers - 1) {
  workerPool.push({
    id: workerId,
    worker: new Worker(new URL("../workers/file-counter.ts", import.meta.url)),
    status: "free",
    def: new Deferred(),
  });
  workerId++;
}

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
const getForWorker = function (): Promise<{
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
    const obj = await getForWorker();
    obj.worker.onmessage = function (e) {
      // console.log("file counted by " + obj.id + ". Lines:" + e.data.payload);
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
        results.promises.push(awaitFromWorker(fsHandle, ext));
      } else {
        // console.log(`file ${handleName} skipped`);
      }
    }
  }
};

const runWithFileCounters = async function (
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

  const results: ClocResultsWithPromises = {
    countedFiles: 0,
    cloc: new Map(),
    promises: [],
  };

  await cloc(dirHandle, results, dirBlackList, fileBlackList);
  console.log("Cloc finished but waiting workers ", results.promises.length);
  const res = await Promise.all(results.promises);
  console.log("worker finished");
  res.forEach(({ ext, lines }) => {
    const amounfPerExt = results.cloc.get(ext) || 0;
    results.cloc.set(ext, amounfPerExt + lines);
  });
  const realResults: ClocResults = {
    countedFiles: results.countedFiles,
    cloc: results.cloc,
  };

  console.log("\n\nWork finished");
  for (const [ext, amount] of realResults.cloc) {
    console.log(`${ext}: ${amount}`);
  }

  return realResults;
};

export { runWithFileCounters };
