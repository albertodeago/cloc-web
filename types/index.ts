import "wicg-file-system-access";

export type WorkerMessage =
  | SetDirHandle
  | ClocResp
  | ClocReqSingleWorker
  | ClocReqLineWorkers
  | ClocReqFileWorkers
  | ClocReqV4;

type SetDirHandle = {
  cmd: "set-dir-handle";
  payload: FileSystemDirectoryHandle;
};

type ClocResp = {
  cmd: "cloc-response";
  payload: ClocResults;
};

type ClocReqSingleWorker = {
  cmd: "cloc-req-single-worker";
};

type ClocReqLineWorkers = {
  cmd: "cloc-req-line-workers";
};

type ClocReqFileWorkers = {
  cmd: "cloc-req-file-workers";
};

type ClocReqV4 = {
  cmd: "cloc-req-v4";
};

export type ClocResults = {
  countedFiles: number;
  cloc: Map<string, number>;
};
