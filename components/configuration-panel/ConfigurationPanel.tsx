import { motion } from "framer-motion";
import { InputRange, Checkbox, BlackList } from "../";

type Props = {
  isOpened: boolean;
  numOfWorkers: number;
  setNumOfWorkers: (v: number) => void;
  isLogActive: boolean;
  setIsLogActive: (v: boolean) => void;
  fileBlackList: string[];
  setFileBlackList: (v: string[]) => void;
  dirBlackList: string[];
  setDirBlackList: (v: string[]) => void;
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
  return (
    <motion.div
      layout
      variants={variants}
      initial="collapsed"
      animate={isOpened ? "expanded" : "collapsed"}
      style={{
        overflow: "hidden",
      }}
    >
      <InputRange value={numOfWorkers} setValue={setNumOfWorkers} />

      <Checkbox
        isChecked={isLogActive}
        setChecked={(e) => setIsLogActive(!isLogActive)}
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
