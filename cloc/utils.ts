/**
 * Given a fileHandle, return the content of the referenced file
 */
const getFileContent = async (
  fileHandle: FileSystemFileHandle
): Promise<string> => {
  const fileData = await fileHandle.getFile();
  const fileText = await fileData.text();
  return fileText;
};

/**
 * Given a fileName, return its extension
 */
const getExtension = (fileName: string): string => {
  const splitName = fileName.split(".");
  if (splitName.length === 1 || splitName[0] === "") {
    return "no-extension";
  }

  const extension = splitName.pop() as string;
  return extension;
};

export { getFileContent, getExtension };
