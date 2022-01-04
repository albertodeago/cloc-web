import styles from "./Checkbox.module.css";

type CheckboxProps = {
  isChecked: boolean;
  setChecked: (checked: boolean) => void;
  text: string;
};

export function Checkbox({ isChecked, setChecked, text }: CheckboxProps) {
  return (
    <div className={styles.checkbox}>
      <label className={styles.checkbox__label}>
        <input
          type="checkbox"
          className={styles.checkbox__input}
          checked={isChecked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        {text}
      </label>
    </div>
  );
}
