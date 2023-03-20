import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import * as Panelbear from '@panelbear/panelbear-js';
import * as Cronitor from '@cronitorio/cronitor-rum-js';
import styles from '../styles/home.module.css';
import { compare, Deferred, logger } from '../utils';
import { run } from '../cloc';
import {
  fileDefaultIgnoreList,
  dirDefaultIgnoreList,
} from '../cloc/ignoreList';
import {
  Head,
  Title,
  Button,
  SettingsIcon,
  InfoCorner,
  AllowMessage,
  Clock,
  TotalResultsLabel,
  HistogramChart,
  ThemeToggle,
  ConfigurationPanel,
  UnsupportedDevice,
} from '../components';
import { WorkerMessage } from '../types';
import { motion } from 'framer-motion';

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
  const [isDeviceSupported, setIsDeviceSupported] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [countedFiles, setCountedFiles] = useState<number>(0);
  const [countedLines, setCountedLines] = useState<number>(0);
  const [counters, setCounters] = useState<Array<[string, string, number]>>([]);
  const [normalizedCounters, setnormalizedCounters] = useState<
    Array<[string, number]>
  >([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const [isOpened, setIsOpened] = useState<boolean>(false);

  const [numOfWorkers, setNumOfWorkers] = useState<number>(8);
  const [fileBlackList, setFileBlackList] = useState<(string | RegExp)[]>([
    ...fileDefaultIgnoreList,
  ]);
  const [dirBlackList, setDirBlackList] = useState<(string | RegExp)[]>([
    ...dirDefaultIgnoreList,
  ]);
  const [isLogActive, setIsLogActive] = useState<boolean>(false);

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

    if (clocRes.size === 0) {
      logger.info(
        'No results, maybe the project is empty? Or everything was in ignore list'
      );
      // TODO: show a message to the user
      return;
    }

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

    // save data
    const clocObj: any = {};
    clocRes.forEach((v, k) => {
      clocObj[k] = v;
    });
    fetch('/.netlify/functions/update', {
      method: 'POST',
      body: JSON.stringify({ data: clocObj }),
    });
  };

  const getDirHandle = async (sendToWorker = true) => {
    try {
      const dh = await window.showDirectoryPicker();
      logger.info('[MainThread] Directory handle received');
      dirHandle = dh;

      if (sendToWorker) {
        dirHandleWorkerDeferred = new Deferred();
        const msg: WorkerMessage = {
          cmd: 'set-dir-handle',
          payload: dirHandle,
        };
        worker.postMessage(msg);

        // we need to wait for the web-workers to have set the dirHandle on its side
        await dirHandleWorkerDeferred.promise;
      }
      return dirHandle;
    } catch (e) {
      logger.error('Something happened while selecting the project.');
    }
  };

  const clocMainThread = async () => {
    const dh = await getDirHandle(false);
    if (!dh) {
      return;
    }
    resetValues();

    setLoading(true);
    startTime = performance.now();
    const results = await run(
      dirHandle,
      dirBlackList,
      fileBlackList,
      isLogActive
    );
    endTime = performance.now();

    let totalLinesOfCode = 0;
    results.cloc.forEach((v) => (totalLinesOfCode += v));

    logResponse(startTime, endTime, totalLinesOfCode, results.countedFiles);
    setLoading(false);
    handleResults(results.countedFiles, totalLinesOfCode, results.cloc);
  };

  // const clocSingleWorker = async () => {
  //   await getDirHandle();

  //   setLoading(true);
  //   const msg: WorkerMessage = {
  //     cmd: "cloc-req-single-worker",
  //     payload: {
  //       numOfWorkers: 1,
  //       isLogActive: isLogActive,
  //       fileIgnoreList: fileBlackList,
  //       dirIgnoreList: dirBlackList,
  //     },
  //   };
  //   startTime = performance.now();
  //   worker.postMessage(msg);
  // };

  // const clocLineWorkers = async () => {
  //   await getDirHandle();
  //   resetValues();

  //   setLoading(true);
  //   const msg: WorkerMessage = {
  //     cmd: "cloc-req-line-workers",
  //   };
  //   startTime = performance.now();
  //   worker.postMessage(msg);
  // };

  const clocFileWorkers = async () => {
    const dh = await getDirHandle();
    if (!dh) {
      return;
    }
    resetValues();

    setLoading(true);
    const msg: WorkerMessage = {
      cmd: 'cloc-req-file-workers',
      payload: {
        numOfWorkers: numOfWorkers,
        isLogActive: isLogActive,
        fileIgnoreList: fileBlackList,
        dirIgnoreList: dirBlackList,
      },
    };
    startTime = performance.now();
    worker.postMessage(msg);
  };

  // const clocV4 = async () => {
  //   await getDirHandle();
  //   resetValues();

  //   setLoading(true);
  //   const msg: WorkerMessage = {
  //     cmd: "cloc-req-v4",
  //     payload: {
  //       numOfWorkers: numOfWorkers,
  //       isLogActive: isLogActive,
  //       fileIgnoreList: fileBlackList,
  //       dirIgnoreList: dirBlackList,
  //     },
  //   };
  //   startTime = performance.now();

  //   logger.info("[MainThread] Sending CLOC request to main worker");
  //   worker.postMessage(msg);
  // };

  const cloc = async () => {
    if (numOfWorkers === 0) {
      await clocMainThread();
    } else {
      await clocFileWorkers();
    }
    Panelbear.track('cloc');
    Cronitor.track('cloc');
  };

  const onWorkerMessage = async ({ data }: { data: WorkerMessage }) => {
    if (data.cmd === 'dir-handle-set') {
      logger.info('[MainThread] Directory handle set on worker side');
      dirHandleWorkerDeferred.resolve();
    } else if (data.cmd === 'cloc-response') {
      logger.info('[MainThread] CLOC response received');
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
    if (typeof window !== 'undefined') {
      if ('showDirectoryPicker' in window) {
        setIsDeviceSupported(true);
      } else {
        setIsDeviceSupported(false);
      }

      worker = new Worker(new URL('../workers/main.ts', import.meta.url));
      worker.addEventListener('message', onWorkerMessage);

      fetch('/.netlify/functions/get-data')
        .then((res) => res.json())
        .then((res) => console.log(res));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    logger.setLogLevel(isLogActive ? 'info' : 'none');
  }, [isLogActive]);

  return (
    <div>
      <Head />
      <InfoCorner />
      <Title />
      <ThemeToggle />

      <main className={styles.mainContent}>
        {isDeviceSupported ? (
          <>
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
            {/* <Button
          disabled={loading}
          onClick={clocFileWorkers}
          text="CLOC of a project (file workers)"
        /> */}
            <div className={styles.buttonWrapper}>
              <Button
                disabled={loading}
                onClick={cloc}
                text=" CLOC of a project"
              />
              <SettingsIcon isOpened={isOpened} setIsOpened={setIsOpened} />
            </div>

            <ConfigurationPanel
              isOpened={isOpened}
              numOfWorkers={numOfWorkers}
              setNumOfWorkers={setNumOfWorkers}
              isLogActive={isLogActive}
              setIsLogActive={setIsLogActive}
              fileBlackList={fileBlackList}
              setFileBlackList={setFileBlackList}
              dirBlackList={dirBlackList}
              setDirBlackList={setDirBlackList}
            />

            <div>
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ paddingTop: '1rem', paddingBottom: '5rem' }}
                >
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
          </>
        ) : (
          <UnsupportedDevice />
        )}
      </main>
    </div>
  );
};

export default Home;
