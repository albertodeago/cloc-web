<template>
  <div>
    <h1>{{ message }}</h1>
    <p>Inform the user that he must give permission to handle file system</p>

    <knight-rider />

    <button @click="getDirHandle">Select project</button>

    <br /><br />
    <button @click="clocMainThread">CLOC IN THE MAIN THREAD</button>
    <br />
    <button @click="clocSingleWorker">CLOC WITH ONE WORKER</button>
    <br />
    <button @click="clocLineWorkers">CLOC WITH LINE COUNTER WORKERS</button>
    <br />
    <button @click="clocFileWorkers">CLOC WITH FILE COUNTER WORKERS</button>
    <br />
    <button @click="clocV4">CLOC V4</button>
  </div>
</template>

<script lang="ts">
import { WorkerMessage } from "./types";
import { run } from "./cloc";

export default {
  name: "app",

  data: () => ({
    worker: null,
    dirHandle: null,
    message: "Hello Vue!",
    startTime: 0,
    endTime: 0,
  }),

  created() {
    if (typeof window !== "undefined") {
      this.worker = this.createMainWorker();
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
    }
  },

  methods: {
    createMainWorker(): Worker {
      return new Worker("./workers/main.ts", { type: "module" });
    },

    /**
     * Get a Directory handle and send it to the worker
     */
    async getDirHandle() {
      // Get a file handle by showing a file picker:
      // @ts-ignore-next-line
      const dirHandle = await window.showDirectoryPicker();
      if (!dirHandle) {
        // User cancelled, or otherwise failed to open a file.
        alert("You must select the directory of a project");
        return;
      }

      const msg: WorkerMessage = {
        cmd: "set-dir-handle",
        payload: dirHandle,
      };

      this.worker.postMessage(msg);
      this.dirHandle = dirHandle;
      return dirHandle;
    },

    async clocMainThread() {
      if (!this.dirHandle) {
        throw new Error("You must select a directory first");
      }
      this.startTime = performance.now();
      const results = await run(this.dirHandle);
      this.endTime = performance.now();

      let totalLinesOfCode = 0;
      results.cloc.forEach((v) => (totalLinesOfCode += v));

      console.log(
        `Successfully CLOC project. Took ${
          this.endTime - this.startTime
        } milliseconds.\nCounted a total of ${
          results.countedFiles
        } files.\nCounted a total of ${totalLinesOfCode} lines of code`
      );

      this.startTime = 0;
      this.endTime = 0;
    },

    /**
     * CLOC with just one WebWorker
     */
    async clocSingleWorker() {
      const msg: WorkerMessage = {
        cmd: "cloc-req-single-worker",
      };

      this.startTime = performance.now();
      this.worker.postMessage(msg);
    },

    /**
     * CLOC using multiple WebWorkers that just count the lines of code
     * (they receive the string that is the file content and return the number of lines)
     */
    async clocLineWorkers() {
      const msg: WorkerMessage = {
        cmd: "cloc-req-line-workers",
      };

      this.startTime = performance.now();
      this.worker.postMessage(msg);
    },

    /**
     * CLOC using multiple WebWorkers that takes a FileHandle, read its content, count the line
     * and then return the results back
     */
    async clocFileWorkers() {
      const msg: WorkerMessage = {
        cmd: "cloc-req-file-workers",
      };

      this.startTime = performance.now();
      this.worker.postMessage(msg);
    },

    /**
     * CLOC using multiple WebWorkers same as FileWorkers, but this time all the workers
     * respond to the main thread directly, this is a fire and forget approach
     */
    async clocV4() {
      const msg: WorkerMessage = {
        cmd: "cloc-req-v4",
      };

      this.startTime = performance.now();
      this.worker.postMessage(msg);
    },
  },
};
</script>
