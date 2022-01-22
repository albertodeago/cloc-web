import { memo } from "react";
import styles from "./ThemeToggle.module.css";
import { toggleTheme } from "../../utils";

function ThemeToggle() {
  return (
    <button className={styles.btn} onClick={() => toggleTheme()}>
      <span className={styles.glow}></span>
    </button>
  );
}

const MemoizedThemeToggle = memo(ThemeToggle);

export { MemoizedThemeToggle as ThemeToggle };
