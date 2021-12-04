export type WorkerMessage =
  | {
      cmd: "ping";
    }
  | {
      cmd: "set-dir-handle";
      payload: SetDirHandleMessagePayload;
    }
  | {
      cmd: "cloc-request";
    }
  | {
      cmd: "cloc-response";
      payload: ClocResponseMessagePayload;
    };

export type SetDirHandleMessagePayload = any;
export type ClocResponseMessagePayload = ClocResults;

export type ClocResults = {
  countedFiles: number;
  cloc: Map<string, number>;
};
