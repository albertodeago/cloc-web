import styles from "./AllowMessage.module.css";

export function AllowMessage() {
  return (
    <p className={styles.text}>
      This application makes use of the{" "}
      <a href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API">
        File System Access API
      </a>{" "}
      to allow the user to select the project to CLOC of.
      <br />
      No data about any project is stored anywhere.
    </p>
  );
}