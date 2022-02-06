import styles from "./UnsupportedDevice.module.css";

function UnsupportedDevice() {
  return (
    <p className={styles.text}>
      Unfortunately your device/browser is not supported. Try again with a
      device that supports{" "}
      <a
        href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API"
        target="_blank"
        rel="noreferrer"
      >
        File System Access API
      </a>
    </p>
  );
}

export { UnsupportedDevice };
