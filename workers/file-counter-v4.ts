import { getFileContent, getExtension } from "../utils";

self.onmessage = async function (e) {
  const { id, cmd, fileName, fileHandle } = e.data;
  if (cmd !== "count-files") {
    throw new Error("[FileCounterWorker] - Unknown command: " + cmd);
  }

  const ext = getExtension(fileName);
  const fileContent = await getFileContent(fileHandle);
  const lines = fileContent.split("\n");

  self.postMessage({
    cmd: "counted-file",
    payload: {
      id,
      ext,
      lines: lines.length,
    },
  });
};
