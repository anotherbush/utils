interface FileOptions {
  type?: string;
  /** The last modified date of the file. `Default`: Date.now(). */
  lastModified?: number;
}

export async function base64ToFile(
  base64String: string,
  filename: string,
  options?: FileOptions
) {
  return fetch(base64String)
    .then((res) => res.blob())
    .then((blob) => new File([blob], filename, options));
}

export function fileListToFiles<Input extends FileList | File>(
  fileList: Input
): File[] {
  return Array.prototype.slice.call<FileList | File, [], File[]>(fileList);
}
