import styles from "./ThemeToggle.module.css";
import { toggleTheme } from "../../utils";

export function ThemeToggle() {
  return (
    <button className={styles.btn} onClick={() => toggleTheme()}>
      <span className={styles.glow}></span>
    </button>
  );
}
