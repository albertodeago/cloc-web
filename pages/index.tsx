import type { NextPage } from "next";
import { useEffect } from "react";
import { run } from "../cloc";
import { KnightRider, Title, InfoCorner } from "../components";
import { WorkerMessage } from "../types";

let worker: Worker;
let dirHandle: FileSystemDirectoryHandle;
let startTime: number = 0;
let endTime: number = 0;

const Home: NextPage = () => {
  const getDirHandle = async () => {
    const dh = await window.showDirectoryPicker();
    if (!dh) {
      alert("You must select the directory of a project");
    } else {
      dirHandle = dh;

      const msg: WorkerMessage = {
        cmd: "set-dir-handle",
        payload: dirHandle,
      };
      worker.postMessage(msg);
    }
  };

  const clocMainThread = async () => {
    if (!dirHandle) {
      throw new Error("You must select a directory first");
    }

    startTime = performance.now();
    const results = await run(dirHandle);
    endTime = performance.now();

    let totalLinesOfCode = 0;
    results.cloc.forEach((v) => (totalLinesOfCode += v));

    console.log(
      `Successfully CLOC project. Took ${
        endTime - startTime
      } milliseconds.\nCounted a total of ${
        results.countedFiles
      } files.\nCounted a total of ${totalLinesOfCode} lines of code`
    );

    startTime = 0;
    endTime = 0;
  };

  const clocSingleWorker = async () => {
    if (!dirHandle) {
      throw new Error("You must select a directory first");
    }

    const msg: WorkerMessage = {
      cmd: "cloc-req-single-worker",
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  const clocLineWorkers = async () => {
    if (!dirHandle) {
      throw new Error("You must select a directory first");
    }

    const msg: WorkerMessage = {
      cmd: "cloc-req-line-workers",
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  const clocFileWorkers = async () => {
    if (!dirHandle) {
      throw new Error("You must select a directory first");
    }

    const msg: WorkerMessage = {
      cmd: "cloc-req-file-workers",
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  const clocV4 = async () => {
    if (!dirHandle) {
      throw new Error("You must select a directory first");
    }

    const msg: WorkerMessage = {
      cmd: "cloc-req-v4",
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      worker = new Worker(new URL("../workers/main.ts", import.meta.url));
      worker.addEventListener(
        "message",
        ({ data }: { data: WorkerMessage }) => {
          console.log(data);

          if (data.cmd === "cloc-response") {
            endTime = performance.now();
            let totalLinesOfCode = 0;
            data.payload.cloc.forEach((v) => (totalLinesOfCode += v));

            console.log(
              `Successfully CLOC project. Took ${
                endTime - startTime
              } milliseconds.\nCounted a total of ${
                data.payload.countedFiles
              } files.\nCounted a total of ${totalLinesOfCode} lines of code`
            );

            startTime = 0;
            endTime = 0;
          }
        }
      );
    }
  }, []);

  return (
    <div>
      <InfoCorner />
      <Title />
      {/* <KnightRider /> */}

      <main>
        <p>
          Inform the user that he has to give permission to access file system
        </p>

        <button onClick={() => getDirHandle()}>Select project</button>

        <button onClick={() => clocMainThread()}>Cloc main thread</button>
        <br />
        <button onClick={() => clocSingleWorker()}>Cloc single worker</button>
        <br />
        <button onClick={() => clocLineWorkers()}>Cloc line workers</button>
        <br />
        <button onClick={() => clocFileWorkers()}>Cloc file workers</button>
        <br />
        <button onClick={() => clocV4()}>Cloc v4</button>
        <br />
      </main>
    </div>
  );
};

export default Home;
