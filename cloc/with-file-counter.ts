import { getFileContent, getExtension } from "./utils";

var Deferred = function Deferred() {
  if (!(this instanceof Deferred)) {
    return new Deferred();
  }

  var self = this;
  self.promise = new Promise(function (resolve, reject) {
    self.resolve = resolve;
    self.reject = reject;
  });
  return self;
};
Deferred.Promise = Promise;

const workerPool = [];
const maxWorkers = 15;
let workerId = 0;

while (workerPool.length < maxWorkers - 1) {
  workerPool.push({
    id: workerId,
    worker: new Worker(new URL("../workers/file-counter.ts", import.meta.url)),
    status: "free",
    def: null,
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

const pollForWorker = (resolve) => {
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

const cloc = async function (dirHandle, results, dirBlackList, fileBlackList) {
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

const runWithFileCounters = async function (dirHandle) {
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
  console.log("Cloc finished but waiting workers ", results.promises.length);
  const res = await Promise.all(results.promises);
  console.log("worker finished");
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

export { runWithFileCounters };
