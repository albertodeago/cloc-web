import { memo } from "react";

type InputRangeProps = {
  value: number;
  setValue: (value: number) => void;
};

let counter = 0;

function InputRange({ value, setValue }: InputRangeProps) {
  const id = "num-of-workers-" + counter++;
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue(parseInt(e.target.value));

  console.log("input range");

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
