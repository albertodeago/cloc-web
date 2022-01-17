import { WorkerMessage, WorkerConfiguration } from "../types";
import { run } from "../cloc";
import { logger } from "../utils";
import { runWithLineCounters } from "../cloc/with-line-counter";
import { runWithFileCounters } from "../cloc/with-file-counter";
import { v4 } from "../cloc/v4";

let dirHandle: FileSystemDirectoryHandle | null = null;
let numOfWorkers: number;
let fileIgnoreList: string[];
let dirIgnoreList: string[];
let isLogActive: boolean;

const initConfiguration = (payload: WorkerConfiguration) => {
  numOfWorkers = payload.numOfWorkers;
  fileIgnoreList = payload.fileIgnoreList;
  dirIgnoreList = payload.dirIgnoreList;
  isLogActive = payload.isLogActive;
};

self.onmessage = async function (e: MessageEvent) {
  let data = e.data as WorkerMessage;
  logger.info(`[MainWorker] Message ${data.cmd} received`);

  switch (data.cmd) {
    case "set-dir-handle":
      dirHandle = data.payload;
      logger.info(`[MainWorker] Dirrectory handle set`);
      const msgHandle: WorkerMessage = {
        cmd: "dir-handle-set",
      };
      self.postMessage(msgHandle);
      break;

    case "cloc-req-single-worker":
      // In this case we use the current worker to process the request
      if (!dirHandle) {
        throw new Error("dirHandle is null");
      }

      logger.info(`[MainWorker] Running cloc on this MainWorker`);

      initConfiguration(data.payload);
      const results = await run(
        dirHandle,
        fileIgnoreList,
        dirIgnoreList,
        isLogActive
      );
      const msg: WorkerMessage = {
        cmd: "cloc-response",
        payload: results,
      };
      self.postMessage(msg);
      break;

    case "cloc-req-line-workers":
      if (!dirHandle) {
        throw new Error("dirHandle is null");
      }
      // This will read all the files and send their content to other workers.
      // These workers will then run cloc on each file and send the results back to this one.
      // Then we can send results back to main thread.
      const resultsv2 = await runWithLineCounters(dirHandle);
      const msgv2: WorkerMessage = {
        cmd: "cloc-response",
        payload: resultsv2,
      };
      self.postMessage(msgv2);
      break;

    case "cloc-req-file-workers":
      if (!dirHandle) {
        throw new Error("dirHandle is null");
      }
      // This will read all the files and send their content to other workers.
      // These workers will then run cloc on each file and send the results back to this one.
      // Then we can send results back to main thread.
      initConfiguration(data.payload);
      const resultsv3 = await runWithFileCounters(
        dirHandle,
        numOfWorkers,
        fileIgnoreList,
        dirIgnoreList,
        isLogActive
      );
      const msgv3: WorkerMessage = {
        cmd: "cloc-response",
        payload: resultsv3,
      };
      self.postMessage(msgv3);
      break;

    case "cloc-req-v4":
      if (!dirHandle) {
        throw new Error("dirHandle is null");
      }
      // spawn a worker that is responsible to iterate through the file system. For each file that he find, increment the
      // number of workers to wait and send the filehandle to a new/free worker.
      // When all the worker ends their job send data to the main thread. To check when the job is done he just increase a counter
      // every time he find a new file to count, and increase another counter when a worker returns the results. When both are equal
      // we're done.
      initConfiguration(data.payload);
      v4(dirHandle, numOfWorkers, fileIgnoreList, dirIgnoreList, isLogActive);
      break;

    default:
      throw new Error(`Unknown command: ${data.cmd}`);
  }
};
