import { memo } from "react";
import styles from "./Title.module.css";

function Title() {
  return (
    <div className={styles.container}>
      <div className={styles.letterContainer}>
        <h1 className={styles.firstLetter}>C</h1>
        <h2 className={styles.verticalText}>ount</h2>
      </div>

      <div className={styles.letterContainer}>
        <h1 className={styles.firstLetter}>L</h1>
        <h2 className={styles.verticalText}>ines</h2>
      </div>

      <div className={styles.letterContainer}>
        <h1 className={styles.firstLetter}>O</h1>
        <h2 className={styles.verticalText}>f</h2>
      </div>

      <div className={styles.letterContainer}>
        <h1 className={styles.firstLetter}>C</h1>
        <h2 className={styles.verticalText}>ode</h2>
      </div>

      <div className={styles.letterContainer}>
        <h1 className={styles.firstLetter}>-</h1>
        <h2 className={styles.verticalText}></h2>
      </div>

      <div className={styles.letterContainer}>
        <h1 className={styles.firstLetter}>W</h1>
        <h2 className={styles.verticalText}></h2>
      </div>

      <div className={styles.letterContainer}>
        <h1 className={styles.firstLetter}>E</h1>
        <h2 className={styles.verticalText}></h2>
      </div>

      <div className={styles.letterContainer}>
        <h1 className={styles.firstLetter}>B</h1>
        <h2 className={styles.verticalText}></h2>
      </div>
    </div>
  );
}

const MemoizedTitle = memo(Title);

export { MemoizedTitle as Title };
