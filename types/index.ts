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
    }
  | {
      cmd: "cloc-request-v2";
    }
  | {
      cmd: "cloc-request-v3";
    }
  | {
      cmd: "cloc-request-v4";
    };

export type SetDirHandleMessagePayload = any;
export type ClocResponseMessagePayload = ClocResults;

export type ClocResults = {
  countedFiles: number;
  cloc: Map<string, number>;
};
