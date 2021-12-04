export type WorkerMessage =
  | {
      cmd: "ping";
    }
  | {
      cmd: "set-dir-handle";
      payload: SetDirHandleMessagePayload;
    }
  | {
      cmd: "cloc";
    };

export type SetDirHandleMessagePayload = any;
