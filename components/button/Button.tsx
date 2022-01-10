import styles from "./Button.module.css";

type ButtonProps = {
  onClick: () => void;
  text: string;
  disabled?: boolean;
  style: React.CSSProperties;
};

export function Button({ onClick, text, disabled, style }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={styles.clocButton}
      onClick={onClick}
      style={style}
    >
      <div className={styles.clocButtonWrapper}>
        <div className={styles.clocButtonFill}></div>
        <span className={styles.clocButtonText}>{text}</span>
      </div>
    </button>
  );
}
