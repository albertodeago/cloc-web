import styles from "./Clock.module.css";

export function Clock() {
  return (
    <div className={styles.clock}>
      <div className={styles.minutes}></div>
      <div className={styles.hours}></div>
    </div>
  );
}
