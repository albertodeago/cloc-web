import { getFileContent } from "../utils";

self.onmessage = async function (e) {
  if (e.data.cmd !== "count-files") {
    console.error("[FileCounterWorker] - Unknown command: " + e.data.cmd);
    return;
  }

  const lines = await countLines(e.data.payload);

  self.postMessage({
    cmd: "counted-file",
    payload: lines,
  });
};

export async function countLines(
  fileHandle: FileSystemFileHandle
): Promise<number> {
  const fileContent = await getFileContent(fileHandle);
  return fileContent.split("\n").length;
}
