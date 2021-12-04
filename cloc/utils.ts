const getFileContent = async (fileHandle): Promise<string> => {
  const fileData = (await fileHandle.getFile()) as File;
  const fileText = await fileData.text();
  return fileText;
};

const getExtension = (fileName: string): string => {
  const splitName = fileName.split(".");
  if (splitName.length === 1 || splitName[0] === "") {
    return "no-extension";
  }

  const extension = splitName.pop();
  return extension;
};

export { getFileContent, getExtension };
