import { useEffect, useRef, memo } from "react";
import { animate, useReducedMotion } from "framer-motion";
import styles from "./TotalResultsLabel.module.css";

interface CounterProps {
  from: number;
  to: number;
}
function Counter({ from, to }: CounterProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(from, to, {
      duration: shouldReduceMotion ? 0 : 1,
      onUpdate(value) {
        if (ref.current) {
          ref.current.textContent = Math.round(value).toLocaleString();
        }
      },
    });
    return () => controls.stop();
  }, [from, to]);

  return <span ref={ref} />;
}

export type TotalResultsLabelProps = {
  countedFiles: number;
  countedLines: number;
  elapsedTime: number;
};
function TotalResultsLabel({
  countedFiles,
  countedLines,
  elapsedTime,
}: TotalResultsLabelProps) {
  return (
    <p className={styles.totalResults} data-test-id="results-label">
      Counted{" "}
      <b>
        <Counter from={0} to={countedFiles} />
      </b>{" "}
      files and{" "}
      <b>
        <Counter from={0} to={countedLines} />
      </b>{" "}
      lines of code (in {elapsedTime.toLocaleString()}ms).
    </p>
  );
}

const MemoizedTotalReulstsLabel = memo(TotalResultsLabel);

export { MemoizedTotalReulstsLabel as TotalResultsLabel };
