import { memo } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  onClick: () => void;
  text: string;
  disabled?: boolean;
};

function Button({ onClick, text, disabled }: ButtonProps) {
  return (
    <button disabled={disabled} className={styles.clocButton} onClick={onClick}>
      <div className={styles.clocButtonWrapper}>
        <div className={styles.clocButtonFill}></div>
        <span className={styles.clocButtonText}>{text}</span>
      </div>
    </button>
  );
}

const MemoizedButton = memo(Button);

export { MemoizedButton as Button };
