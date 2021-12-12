export type WorkerMessage =
  | {
      cmd: "set-dir-handle";
      payload: SetDirHandleMessagePayload;
    }
  | {
      cmd: "cloc-response";
      payload: ClocResponseMessagePayload;
    }
  | ClocReqSingleWorker
  | ClocReqLineWorkers
  | ClocReqFileWorkers
  | ClocReqV4;

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

export type SetDirHandleMessagePayload = any;
export type ClocResponseMessagePayload = ClocResults;

export type ClocResults = {
  countedFiles: number;
  cloc: Map<string, number>;
};
