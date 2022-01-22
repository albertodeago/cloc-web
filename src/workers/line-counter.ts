// @ts-ignore-line
self.onmessage = async function (e) {
  if (e.data.cmd !== "count-lines") {
    throw new Error("[LineCounterWorker] - Unknown command: " + e.data.cmd);
  }

  const lines = countLines(e.data.payload as string);

  self.postMessage({
    cmd: "counted-lines",
    payload: lines,
  });
};

export function countLines(data: string): number {
  return data.split("\n").length;
}
