import { WorkerMessage } from "../types";
import { run } from "../cloc";
import { runWithLineCounters } from "../cloc/with-line-counter";
import { runWithFileCounters } from "../cloc/with-file-counter";

let dirHandle: any | null = null; // TODO: this should be typed

self.onmessage = async function (e: MessageEvent) {
  let data = e.data as WorkerMessage;
  console.log(`[worker]: ${data.cmd}`);

  switch (data.cmd) {
    case "ping":
      self.postMessage({
        type: "hello",
        payload: "Hello from worker !",
      });
      break;

    case "set-dir-handle":
      dirHandle = data.payload;
      break;

    case "cloc-request":
      if (!dirHandle) {
        throw new Error("dirHandle is null");
      }
      const results = await run(dirHandle);
      const msg: WorkerMessage = {
        cmd: "cloc-response",
        payload: results,
      };
      self.postMessage(msg);
      break;

    case "cloc-request-v2":
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

    case "cloc-request-v3":
      if (!dirHandle) {
        throw new Error("dirHandle is null");
      }
      // This will read all the files and send their content to other workers.
      // These workers will then run cloc on each file and send the results back to this one.
      // Then we can send results back to main thread.
      const resultsv3 = await runWithFileCounters(dirHandle);
      const msgv3: WorkerMessage = {
        cmd: "cloc-response",
        payload: resultsv3,
      };
      self.postMessage(msgv3);
      break;

    default:
      throw new Error(`Unknown command: ${data.cmd}`);
  }
};
