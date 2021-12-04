self.onmessage = async function (e) {
  if (e.data.cmd !== "count-lines") {
    throw new Error("[FileCounterWorker] - Unknown command: " + e.data.cmd);
  }

  const fileContent = e.data.payload as string;
  const lines = fileContent.split("\n");

  self.postMessage({
    cmd: "counted-lines",
    payload: lines.length,
  });
};
