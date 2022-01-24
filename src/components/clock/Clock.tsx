import { memo } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./Clock.module.css";

function Clock() {
  const shouldReduceMotion = useReducedMotion();

  return shouldReduceMotion ? (
    <div className={styles.textLoading}>Counting... Wait</div>
  ) : (
    <div className={styles.clock}>
      <div className={styles.minutes}></div>
      <div className={styles.hours}></div>
    </div>
  );
}

const MemoizedClock = memo(Clock);
export { MemoizedClock as Clock };
