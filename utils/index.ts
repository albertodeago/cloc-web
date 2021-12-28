export function compare(a: [string, number], b: [string, number]) {
  if (a[1] > b[1]) {
    return -1;
  }
  if (a[1] < b[1]) {
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
