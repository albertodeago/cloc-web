type InputRangeProps = {
  label: string;
  value: number;
  setValue: (value: number) => void;
};

let counter = 0;

export function InputRange({ label, value, setValue }: InputRangeProps) {
  const id = "num-of-workers-" + counter++;

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
        onChange={(e) => setValue(parseInt(e.target.value))}
      />
    </div>
  );
}
