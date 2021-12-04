<template>
  <div>
    <h1>{{ message }}</h1>
    <p>Inform the user that he must give permission to handle file system</p>

    <button @click="getDirHandle">Select project</button>
    <button @click="cloc">CLOC</button>
  </div>
</template>

<script lang="ts">
import { WorkerMessage } from "./types";

export default {
  name: "app",

  data: () => ({
    worker: null,
    message: "Hello Vue!",
  }),

  created() {
    if (typeof window !== "undefined") {
      console.log("created");
      this.worker = new Worker("./workers/main.ts", { type: "module" });
      this.worker.addEventListener("message", (e) => {
        const { type, payload } = e.data;
        console.log({ type, payload });
      });
      this.worker.postMessage({
        type: "ping",
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
        cmd: "cloc",
      };
      this.worker.postMessage(msg);
    },
  },
};
</script>
