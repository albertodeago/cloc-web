import React, { memo, useCallback } from "react";
import styles from "./Checkbox.module.css";

type CheckboxProps = {
  isChecked: boolean;
  setChecked: (checked: boolean) => void;
  text: string;
};

function Checkbox({ isChecked, setChecked, text }: CheckboxProps) {
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setChecked(e.target.checked),
    [setChecked]
  );

  console.log("Checkbox");
  return (
    <div className={styles.checkbox}>
      <label className={styles.checkbox__label}>
        <input
          type="checkbox"
          className={styles.checkbox__input}
          checked={isChecked}
          onChange={onChange}
        />
        {text}
      </label>
    </div>
  );
}

const MemoizedCheckbox = memo(Checkbox);

export { MemoizedCheckbox as Checkbox };
