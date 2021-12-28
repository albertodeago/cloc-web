import { getFileContent } from "../utils";

self.onmessage = async function (e) {
  if (e.data.cmd !== "count-files") {
    throw new Error("[FileCounterWorker] - Unknown command: " + e.data.cmd);
  }

  const fileHandle = e.data.payload;
  const fileContent = await getFileContent(fileHandle);
  const lines = fileContent.split("\n");

  self.postMessage({
    cmd: "counted-file",
    payload: lines.length,
  });
};
