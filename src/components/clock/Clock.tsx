import { memo } from "react";
import styles from "./Clock.module.css";

function Clock() {
  return (
    <div className={styles.clock}>
      <div className={styles.minutes}></div>
      <div className={styles.hours}></div>
    </div>
  );
}

const MemoizedClock = memo(Clock);
export { MemoizedClock as Clock };
