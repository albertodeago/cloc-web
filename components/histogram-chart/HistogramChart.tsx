import { memo } from "react";
import { motion } from "framer-motion";
import styles from "./HistogramChart.module.css";

interface ChartProps {
  counters: [string, string, number][];
  normalizedCounters: [string, number][];
}

/**
 * Animation for the histogram's lines
 */
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

/**
 * Animation for the histogram's labels
 * Pretty much the same of the lines, but deplaied a bit
 */
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

const getTop = (i: number) => ({ top: `${i * 30}px` });

function HistogramChart({ counters, normalizedCounters }: ChartProps) {
  return (
    <div className={styles.results}>
      {counters.map(([ext, label, v], i) => (
        <motion.span
          className={styles.resultsLabel}
          style={getTop(i)}
          key={ext + "-label"}
          initial="hidden"
          animate="visible"
          variants={labelsAnim}
          custom={i + 1}
        >
          {label}
        </motion.span>
      ))}

      <motion.svg
        className={styles.chart}
        width="100%"
        height={counters.length * 30}
        initial="hidden"
        animate="visible"
      >
        {normalizedCounters.map(([ext, v], i) => (
          <motion.line
            key={ext}
            x1={0}
            x2={v + "%"}
            y1={i * 30 + 22}
            y2={i * 30 + 22}
            variants={linesAnim}
            custom={i}
          />
        ))}
      </motion.svg>
    </div>
  );
}

const MemoizedHistogramChart = memo(HistogramChart);

export { MemoizedHistogramChart as HistogramChart };
