import { getFileContent, getExtension, logger } from "../utils";

self.onmessage = async function (e) {
  const { id, cmd, fileName, fileHandle } = e.data;
  if (cmd !== "count-files") {
    logger.error("[FileCounterWorker] - Unknown command: " + cmd);
    return;
  }
  logger.info(`[Worker ${id}] - Counting ${fileName}`);

  const ext = getExtension(fileName);
  const lines = await countLines(fileHandle);

  self.postMessage({
    cmd: "counted-file",
    payload: {
      id,
      ext,
      lines: lines,
    },
  });
};

export async function countLines(
  fileHandle: FileSystemFileHandle
): Promise<number> {
  const fileContent = await getFileContent(fileHandle);
  return fileContent.split("\n").length;
}
