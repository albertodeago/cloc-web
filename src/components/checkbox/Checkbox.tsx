import React from "react";
import styles from "./Checkbox.module.css";

type CheckboxProps = {
  isChecked: boolean;
  setLogActive: (checked: boolean) => void;
  text: string;
};

function Checkbox({ isChecked, setLogActive, text }: CheckboxProps) {
  return (
    <div className={styles.checkbox}>
      <label className={styles.checkbox__label}>
        <input
          type="checkbox"
          className={styles.checkbox__input}
          checked={isChecked}
          onChange={() => setLogActive(!isChecked)}
        />
        {text}
      </label>
    </div>
  );
}

export { Checkbox };
