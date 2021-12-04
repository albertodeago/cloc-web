import { WorkerMessage } from "../types";
import { run } from "../cloc";

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

    default:
      throw new Error(`Unknown command: ${data.cmd}`);
  }
};
