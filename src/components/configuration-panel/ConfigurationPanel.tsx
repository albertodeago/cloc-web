import { motion, useReducedMotion } from "framer-motion";
import { InputRange, Checkbox, BlackList } from "../";

type Props = {
  isOpened: boolean;
  numOfWorkers: number;
  setNumOfWorkers: (v: number) => void;
  isLogActive: boolean;
  setIsLogActive: (v: boolean) => void;
  fileBlackList: (string | RegExp)[];
  setFileBlackList: (v: (string | RegExp)[]) => void;
  dirBlackList: (string | RegExp)[];
  setDirBlackList: (v: (string | RegExp)[]) => void;
};

const variants = {
  expanded: {
    opacity: 1,
    height: "auto",
  },
  collapsed: {
    opacity: 0,
    height: 0,
  },
};

export function ConfigurationPanel({
  isOpened,
  numOfWorkers,
  setNumOfWorkers,
  isLogActive,
  setIsLogActive,
  fileBlackList,
  setFileBlackList,
  dirBlackList,
  setDirBlackList,
}: Props) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      layout
      variants={variants}
      initial="collapsed"
      animate={isOpened ? "expanded" : "collapsed"}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      style={{
        overflow: "hidden",
      }}
    >
      <InputRange value={numOfWorkers} setValue={setNumOfWorkers} />

      <Checkbox
        isChecked={isLogActive}
        setLogActive={setIsLogActive}
        text="Activate logs (on console)"
      />

      <BlackList type="file" list={fileBlackList} setList={setFileBlackList} />

      <BlackList
        type="directory"
        list={dirBlackList}
        setList={setDirBlackList}
      />
    </motion.div>
  );
}
