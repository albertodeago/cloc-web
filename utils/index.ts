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
