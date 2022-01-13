/**
 * Compare function for sorting arrays of tuples.
 */
export function compare(
  a: [string, string, number],
  b: [string, string, number]
) {
  if (a[2] > b[2]) {
    return -1;
  }
  if (a[2] < b[2]) {
    return 1;
  }
  return 0;
}

/**
 * Generates a random string
 *
 * @param int length_
 * @return string
 */
export function randomString(l: number = 6) {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz".split("");
  let str = "";
  for (let i = 0; i < l; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

/**
 * Given a fileHandle, return the content of the referenced file
 */
export async function getFileContent(
  fileHandle: FileSystemFileHandle
): Promise<string> {
  const fileData = await fileHandle.getFile();
  const fileText = await fileData.text();
  return fileText;
}

/**
 * Given a fileName, return its extension
 */
export function getExtension(fileName: string): string {
  const splitName = fileName.split(".");
  if (splitName.length === 1 || splitName[0] === "") {
    return "no-extension";
  }

  const extension = splitName.pop() as string;
  return extension;
}

/**
 * Deferred implementation
 */
export class Deferred<T> {
  public promise: Promise<T>;

  // @ts-ignore-line
  private _resolve: Function;
  // @ts-ignore-line
  private _reject: Function;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  resolve(value?: any) {
    this._resolve(value);
  }

  reject(reason?: any) {
    this._reject(reason);
  }
}

/**
 * Toggle (or set) the theme on the document
 */
export const toggleTheme = (value?: "light" | "dark") => {
  if (value) {
    document.documentElement.setAttribute("data-theme", value);
  } else {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }
};

type LogLevel = "none" | "info" | "warning" | "error";
class Logger {
  /**
   * 0 means no logs
   * 1 means only error
   * 2 means error and warning
   * 3 means error, warning and info
   */
  // @ts-ignore-next-line
  private logLevel: 0 | 1 | 2 | 3;

  constructor(level: LogLevel) {
    this.setLogLevel(level);
  }

  setLogLevel(level: LogLevel) {
    this.logLevel =
      level === "none"
        ? 0
        : level === "error"
        ? 1
        : level === "warning"
        ? 2
        : 3;
  }

  info(message: string) {
    if (this.logLevel >= 3) console.info(message);
  }
  warning(message: string) {
    if (this.logLevel >= 2) console.warn(message);
  }
  error(message: string) {
    if (this.logLevel >= 1) console.error(message);
  }
}
export const logger = new Logger("error");
