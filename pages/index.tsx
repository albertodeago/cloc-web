import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import styles from "../styles/home.module.css";
import { compare, Deferred, logger } from "../utils";
import { run } from "../cloc";
import {
  Title,
  Button,
  InfoCorner,
  AllowMessage,
  Clock,
  TotalResultsLabel,
  HistogramChart,
  ThemeToggle,
} from "../components";
import { WorkerMessage } from "../types";
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

const logResponse = (
  startTime: number,
  endTime: number,
  totalLinesOfCode: number,
  countedFiles: number
): void => {
  logger.info(
    `Successfully CLOC project. Took ${
      endTime - startTime
    } milliseconds.\nCounted a total of ${countedFiles} files.\nCounted a total of ${totalLinesOfCode} lines of code`
  );
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
      return;
    } else {
      logger.info("[MainThread] Directory handle received");
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

    logger.info("[MainThread] Sending CLOC request to main worker");
    worker.postMessage(msg);
  };

  const onWorkerMessage = async ({ data }: { data: WorkerMessage }) => {
    if (data.cmd === "dir-handle-set") {
      logger.info("[MainThread] Directory handle set on worker side");
      dirHandleWorkerDeferred.resolve();
    } else if (data.cmd === "cloc-response") {
      logger.info("[MainThread] CLOC response received");
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
      <Head>
        <title>CLOC-web</title>
        {/* Inject a script to avoid theme flashing when user saved dark theme as its preference */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
            let theme = localStorage.getItem("theme");
            if (theme !== "light" && theme !== "dark") {
              theme = undefined;
            }
            if (theme) {
              document.documentElement.setAttribute("data-theme", theme);
            }
            `,
          }}
        ></script>
      </Head>
      <InfoCorner />
      <Title />
      <ThemeToggle />

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
        <Button
          disabled={loading}
          onClick={clocFileWorkers}
          text="CLOC of a project (file workers)"
        />
        <Button
          disabled={loading}
          onClick={clocV4}
          text=" CLOC of a project (v4)"
        />
        >

        <div>
          {loading ? (
            <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
              <Clock />
            </motion.div>
          ) : (
            countedFiles !== 0 &&
            countedLines !== 0 && (
              <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
                <TotalResultsLabel
                  countedFiles={countedFiles}
                  countedLines={countedLines}
                  elapsedTime={elapsedTime}
                />
                <HistogramChart
                  counters={counters}
                  normalizedCounters={normalizedCounters}
                />
              </motion.div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
