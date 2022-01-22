import { memo } from "react";
import styles from "./AllowMessage.module.css";

function AllowMessage() {
  return (
    <p className={styles.text}>
      This application makes use of the{" "}
      <a
        href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API"
        target="_blank"
        rel="noreferrer"
      >
        File System Access API
      </a>{" "}
      to allow the user to select the project to CLOC of. You will be prompted
      to give the browser access to your file system.
      <br />
      We store only the number of visits and the <i>number</i> of lines counted,
      all the data is collected anonymously and cannot be traced back to any
      project / user.
    </p>
  );
}

const MemoizedAllowMessage = memo(AllowMessage);

export { MemoizedAllowMessage as AllowMessage };
