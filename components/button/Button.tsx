import styles from "./Button.module.css";

type ButtonProps = {
  onClick: () => void;
  text: string;
  disabled: boolean;
};

export function Button({ onClick, text, disabled }: ButtonProps) {
  return (
    <button disabled={disabled} className={styles.clocButton} onClick={onClick}>
      <div className={styles.clocButtonWrapper}>
        <div className={styles.clocButtonFill}></div>
        <span className={styles.clocButtonText}>{text}</span>
      </div>
    </button>
  );
}
