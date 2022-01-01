import styles from "./AllowMessage.module.css";

export function AllowMessage() {
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
      No data about any project is stored anywhere.
    </p>
  );
}
