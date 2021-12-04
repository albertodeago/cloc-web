<template>
  <div>
    <h1>{{ message }}</h1>
    <p>Inform the user that he must give permission to handle file system</p>

    <button @click="getDirHandle">Select project</button>
    <br />
    <button @click="cloc">CLOC</button>
    <br />
    <button @click="clocV2">CLOC WITH LINE COUNTER WORKERS</button>
    <br />
    <button @click="clocV3">CLOC WITH FILE COUNTER WORKERS</button>
  </div>
</template>

<script lang="ts">
import { WorkerMessage } from "./types";

export default {
  name: "app",

  data: () => ({
    worker: null,
    message: "Hello Vue!",
    startTime: 0,
    endTime: 0,
  }),

  created() {
    if (typeof window !== "undefined") {
      console.log("created");
      this.worker = new Worker("./workers/main.ts", { type: "module" });
      this.worker.addEventListener(
        "message",
        ({ data }: { data: WorkerMessage }) => {
          console.log(data);

          if (data.cmd === "cloc-response") {
            this.endTime = performance.now();
            let totalLinesOfCode = 0;
            data.payload.cloc.forEach((v) => (totalLinesOfCode += v));

            console.log(
              `Successfully CLOC project. Took ${
                this.endTime - this.startTime
              } milliseconds.\nCounted a total of ${
                data.payload.countedFiles
              } files.\nCounted a total of ${totalLinesOfCode} lines of code`
            );

            this.startTime = 0;
            this.endTime = 0;
          }
        }
      );
      this.worker.postMessage({
        cmd: "ping",
        payload: "Hello from the main!",
      });
    }
  },

  methods: {
    async getDirHandle() {
      // Get a file handle by showing a file picker:
      // @ts-ignore-next-line
      const dirHandle = await window.showDirectoryPicker();
      if (!dirHandle) {
        // User cancelled, or otherwise failed to open a file.
        console.error(
          "No handle, the user cancelled the operation or something is wrong"
        );
        // TODO: inform the user?
        return;
      }

      const msg: WorkerMessage = {
        cmd: "set-dir-handle",
        payload: dirHandle,
      };
      this.worker.postMessage(msg);
      return dirHandle;
    },

    async cloc() {
      const msg: WorkerMessage = {
        cmd: "cloc-request",
      };

      this.startTime = performance.now();
      this.worker.postMessage(msg);
    },

    async clocV2() {
      const msg: WorkerMessage = {
        cmd: "cloc-request-v2",
      };

      this.startTime = performance.now();
      this.worker.postMessage(msg);
    },

    async clocV3() {
      const msg: WorkerMessage = {
        cmd: "cloc-request-v3",
      };

      this.startTime = performance.now();
      this.worker.postMessage(msg);
    },
  },
};
</script>
