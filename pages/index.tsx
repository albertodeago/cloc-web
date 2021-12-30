import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import styles from "../styles/home.module.css";
import { compare, Deferred } from "../utils";
import { run } from "../cloc";
import { Title, InfoCorner, AllowMessage, Clock } from "../components";
import { ClocResults, WorkerMessage } from "../types";
import { motion } from "framer-motion";

// main worker reference
let worker: Worker;

// directory handle
let dirHandle: FileSystemDirectoryHandle;

// timers to calculate the time it takes to CLOC
let startTime: number = 0;
let endTime: number = 0;

// Deferred to wait for the worker to set the dirHandle on its side
let dirHandleWorkerDeferred: Deferred<void>;

const linesAnim = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => {
    const delay = 1 + i * 0.5;
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay, duration: 0.01 },
      },
    };
  },
};

const labelsAnim = {
  hidden: { opacity: 0 },
  visible: (i: number) => {
    const delay = 1 + i * 0.5;
    return {
      opacity: 1,
      transition: {
        opacity: { delay, duration: 0.5 },
      },
    };
  },
};

const Home: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [countedFiles, setCountedFiles] = useState<number>(0);
  const [countedLines, setCountedLines] = useState<number>(0);
  const [counters, setCounters] = useState<Array<[string, string, number]>>([]);
  const [normalizedCounters, setnormalizedCounters] = useState<
    Array<[string, number]>
  >([]);
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

  const resetValues = (): void => {
    setCountedFiles(0);
    setCountedLines(0);
    setCounters([]);
    setnormalizedCounters([]);
    setElapsedTime(0);
  };

  const handleResults = (
    countedFiles: number,
    countedLines: number,
    clocRes: Map<string, number>
  ) => {
    setElapsedTime(Math.round(endTime - startTime));
    setCountedFiles(countedFiles);
    setCountedLines(countedLines);
    const counters: Array<[string, string, number]> = [];
    clocRes.forEach((v, k) => {
      const total = ((v / countedLines) * 100).toFixed(2);
      const label = `${k} - ${v} (${total}% of total)`;
      const label = `${k} - ${v.toLocaleString()} lines (${total}% of total)`;
      counters.push([k, label, v]);
    });
    counters.sort(compare);
    setCounters(counters);

    const normalizedCounters: Array<[string, number]> = [];
    const max = counters[0][2];
    const limit = 99;
    const normalize = (v: number) => (limit * v) / max;

    counters.forEach(([k, l, v]) => {
      normalizedCounters.push([k, normalize(v)]);
    });
    setnormalizedCounters(normalizedCounters);

    startTime = 0;
    endTime = 0;
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
    resetValues();

    setLoading(true);
    startTime = performance.now();
    const results = await run(dirHandle);
    endTime = performance.now();

    let totalLinesOfCode = 0;
    results.cloc.forEach((v) => (totalLinesOfCode += v));

    logResponse(startTime, endTime, totalLinesOfCode, results.countedFiles);
    setLoading(false);
    handleResults(results.countedFiles, totalLinesOfCode, results.cloc);
  };

  const clocSingleWorker = async () => {
    await getDirHandle();

    setLoading(true);
    const msg: WorkerMessage = {
      cmd: "cloc-req-single-worker",
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  const clocLineWorkers = async () => {
    await getDirHandle();
    resetValues();

    setLoading(true);
    const msg: WorkerMessage = {
      cmd: "cloc-req-line-workers",
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  const clocFileWorkers = async () => {
    await getDirHandle();
    resetValues();

    setLoading(true);
    const msg: WorkerMessage = {
      cmd: "cloc-req-file-workers",
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  const clocV4 = async () => {
    await getDirHandle();
    resetValues();

    setLoading(true);
    const msg: WorkerMessage = {
      cmd: "cloc-req-v4",
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  const onWorkerMessage = async ({ data }: { data: WorkerMessage }) => {
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

      setLoading(false);
      handleResults(
        data.payload.countedFiles,
        totalLinesOfCode,
        data.payload.cloc
      );
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

        {/* <button disabled={loading} className={styles.clocButton} onClick={clocMainThread}>
          CLOC of a project (main thread)
        </button>
        <button disabled={loading} className={styles.clocButton} onClick={clocSingleWorker}>
          CLOC of a project (single worker)
        </button>
        <button disabled={loading} className={styles.clocButton} onClick={clocLineWorkers}>
          CLOC of a project (line workers)
        </button> */}
        <button
          disabled={loading}
          className={styles.clocButton}
          onClick={clocFileWorkers}
        >
          CLOC of a project (file workers)
        </button>
        <button
          disabled={loading}
          className={styles.clocButton}
          onClick={clocV4}
        >
          CLOC of a project (v4)
        </button>

        <div>
          {loading ? (
            <Clock />
          ) : (
            countedFiles !== 0 &&
            countedLines !== 0 && (
              <>
                <p className={styles.totalResults}>
                  Counted <b>{countedFiles}</b> files and <b>{countedLines}</b>{" "}
                  lines of code (in {elapsedTime}ms).
                </p>

                <div className={styles.results}>
                  {counters.map(([ext, label, v], i) => (
                    <motion.span
                      className={styles.resultsLabel}
                      style={{
                        top: `${i * 30}px`,
                      }}
                      key={ext + "-label"}
                      initial="hidden"
                      animate="visible"
                      variants={labelsAnim}
                      custom={i}
                    >
                      {label}
                    </motion.span>
                  ))}

                  <motion.svg
                    width="100%"
                    height={counters.length * 30}
                    // viewBox={`0 0 100% ${counters.length * 30}`}
                    initial="hidden"
                    animate="visible"
                  >
                    {normalizedCounters.map(([ext, v], i) => (
                      <motion.line
                        key={ext}
                        x1={0}
                        x2={v + "%"}
                        y1={i * 30 + 20}
                        y2={i * 30 + 20}
                        stroke="#00cc88"
                        variants={linesAnim}
                        custom={i}
                      />
                    ))}
                  </motion.svg>
                  {/* <ul>
                {counters.map((obj) => (
                  <li key={obj[0]}>
                    {obj[0]} - {obj[1]}
                  </li>
                ))}
              </ul> */}
                </div>
              </>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
