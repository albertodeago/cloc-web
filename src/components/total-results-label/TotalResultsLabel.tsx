import { useEffect, useRef, memo } from "react";
import { animate } from "framer-motion";
import styles from "./TotalResultsLabel.module.css";

interface CounterProps {
  from: number;
  to: number;
}
function Counter({ from, to }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(from, to, {
      duration: 1,
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
    <p className={styles.totalResults}>
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
