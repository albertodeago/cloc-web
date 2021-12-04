import { WorkerMessage } from "../types";
import { run } from "../cloc";

let dirHandle: any | null = null; // TODO: this should be typed

self.onmessage = function (e: MessageEvent) {
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
    case "cloc":
      if (!dirHandle) {
        throw new Error("dirHandle is null");
      }
      run(dirHandle);
  }
};
