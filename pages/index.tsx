import type { NextPage } from "next";
import { useEffect, useState } from "react";
import styles from "../styles/home.module.css";
import { compare, Deferred } from "../utils";
import { run } from "../cloc";
import { KnightRider, Title, InfoCorner, AllowMessage } from "../components";
import { WorkerMessage } from "../types";

let worker: Worker;
let dirHandle: FileSystemDirectoryHandle;
let startTime: number = 0;
let endTime: number = 0;
let dirHandleWorkerDeferred: Deferred<void>;

const Home: NextPage = () => {
  const [countedFiles, setCountedFiles] = useState<number>(0);
  const [countedLines, setCountedLines] = useState<number>(0);
  const [counters, setCounters] = useState<Array<[string, number]>>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const logResponse = (
    startTime: number,
    endTime: number,
    totalLinesOfCode: number,
    countedFiles: number
  ): void => {
    console.log(
      `Successfully CLOC project. Took ${
        endTime - startTime
      } milliseconds.\nCounted a total of ${countedFiles} files.\nCounted a total of ${totalLinesOfCode} lines of code`
    );
  };

  const getDirHandle = async () => {
    const dh = await window.showDirectoryPicker();
    if (!dh) {
      alert("You must select the directory of a project");
      throw new Error("No directory selected");
    } else {
      dirHandle = dh;
      dirHandleWorkerDeferred = new Deferred();
      const msg: WorkerMessage = {
        cmd: "set-dir-handle",
        payload: dirHandle,
      };
      worker.postMessage(msg);

      // we need to wait for the web-workers to have set the dirHandle on its side
      await dirHandleWorkerDeferred.promise;
    }
  };

  const clocMainThread = async () => {
    await getDirHandle();

    startTime = performance.now();
    const results = await run(dirHandle);
    endTime = performance.now();

    let totalLinesOfCode = 0;
    results.cloc.forEach((v) => (totalLinesOfCode += v));

    logResponse(startTime, endTime, totalLinesOfCode, results.countedFiles);
    startTime = 0;
    endTime = 0;
  };

  const clocSingleWorker = async () => {
    await getDirHandle();

    const msg: WorkerMessage = {
      cmd: "cloc-req-single-worker",
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  const clocLineWorkers = async () => {
    await getDirHandle();

    const msg: WorkerMessage = {
      cmd: "cloc-req-line-workers",
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  const clocFileWorkers = async () => {
    await getDirHandle();

    const msg: WorkerMessage = {
      cmd: "cloc-req-file-workers",
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  const clocV4 = async () => {
    await getDirHandle();

    const msg: WorkerMessage = {
      cmd: "cloc-req-v4",
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  const onWorkerMessage = async ({ data }: { data: WorkerMessage }) => {
    console.log(data);

    if (data.cmd === "dir-handle-set") {
      console.log("Worker has set the dirHandle");
      dirHandleWorkerDeferred.resolve();
    } else if (data.cmd === "cloc-response") {
      endTime = performance.now();
      let totalLinesOfCode = 0;
      data.payload.cloc.forEach((v) => (totalLinesOfCode += v));

      logResponse(
        startTime,
        endTime,
        totalLinesOfCode,
        data.payload.countedFiles
      );

      setElapsedTime(Math.round(endTime - startTime));
      setCountedFiles(data.payload.countedFiles);
      setCountedLines(totalLinesOfCode);
      const counters: Array<[string, number]> = [];
      data.payload.cloc.forEach((v, k) => counters.push([k, v]));
      counters.sort(compare);
      setCounters(counters);

      startTime = 0;
      endTime = 0;
    }
  };

  useEffect(() => {
    // create web worker client side
    if (typeof window !== "undefined") {
      worker = new Worker(new URL("../workers/main.ts", import.meta.url));
      worker.addEventListener("message", onWorkerMessage);
    }
  }, []);

  return (
    <div>
      <InfoCorner />
      <Title />
      {/* <KnightRider /> */}

      <main className={styles.mainContent}>
        <AllowMessage />

        {/* <button onClick={() => getDirHandle()}>Select project</button> */}

        <button onClick={() => clocMainThread()}>Cloc main thread</button>
        <br />
        <button onClick={() => clocSingleWorker()}>Cloc single worker</button>
        <br />
        <button onClick={() => clocLineWorkers()}>Cloc line workers</button>
        <br />
        <button onClick={() => clocFileWorkers()}>Cloc file workers</button>
        <br />
        <button id="cloc-v4" onClick={() => clocV4()}>
          Cloc v4
        </button>
        <br />

        <div className="results">
          {countedFiles !== 0 && countedLines !== 0 && (
            <>
              <p className="total">
                Counted {countedFiles} files and {countedLines} lines of code in{" "}
                {elapsedTime}ms.
              </p>
              <ul>
                {counters.map((obj) => (
                  <li key={obj[0]}>
                    {obj[0]} - {obj[1]}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
