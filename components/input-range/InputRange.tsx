import { memo, useEffect, useState } from "react";
import { randomString } from "../../utils";

type InputRangeProps = {
  value: number;
  setValue: (value: number) => void;
};

function InputRange({ value, setValue }: InputRangeProps) {
  const [id, setId] = useState<string>("");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue(parseInt(e.target.value));

  // this is just to avoid reconciliation errors to have random ids...
  useEffect(() => {
    setId(`num-of-workers-${randomString()}`);
  }, []);

  return (
    <div>
      <label htmlFor={id}>
        Number of workers <b>{value}</b>
        {value === 0 ? <span> (0 means CLOC in main thread)</span> : <> </>}
      </label>
      <input
        type="range"
        id={id}
        name="numWorkers"
        min="0"
        max="40"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

const MemoizedInputRange = memo(InputRange);

export { MemoizedInputRange as InputRange };
