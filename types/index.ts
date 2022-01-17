import "wicg-file-system-access";

export type WorkerMessage =
  | SetDirHandle
  | DirHandleSet
  | ClocResp
  | ClocReqSingleWorker
  | ClocReqLineWorkers
  | ClocReqFileWorkers
  | ClocReqV4;

type SetDirHandle = {
  cmd: "set-dir-handle";
  payload: FileSystemDirectoryHandle;
};

type DirHandleSet = {
  cmd: "dir-handle-set";
};

type ClocResp = {
  cmd: "cloc-response";
  payload: ClocResults;
};

type ClocReqSingleWorker = {
  cmd: "cloc-req-single-worker";
  payload: WorkerConfiguration;
};

type ClocReqLineWorkers = {
  cmd: "cloc-req-line-workers";
};

type ClocReqFileWorkers = {
  cmd: "cloc-req-file-workers";
  payload: WorkerConfiguration;
};

type ClocReqV4 = {
  cmd: "cloc-req-v4";
  payload: WorkerConfiguration;
};

export type WorkerConfiguration = {
  numOfWorkers: number;
  fileIgnoreList: string[];
  dirIgnoreList: string[];
  isLogActive: boolean;
};

export type ClocResults = {
  countedFiles: number;
  cloc: Map<string, number>;
};
