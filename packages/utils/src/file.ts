import { isBrowser } from './type-checker';

export type CompressImageOptions = {
  log: boolean;
};

export function compressImage<Src extends File | string>(
  src: Src,
  maxMb: number,
  options?: CompressImageOptions,
): Promise<Src>;
export function compressImage<Src extends File | string = File>(
  file: Src,
  maxMb: number,
  options?: CompressImageOptions,
): Promise<File>;
export function compressImage<Src extends File | string = string>(
  base64: Src,
  maxMb: number,
  options?: CompressImageOptions,
): Promise<string>;
export function compressImage<Src extends File | string>(
  src: Src,
  maxMb: number,
  options?: CompressImageOptions,
): Promise<any> {
  if (!isBrowser()) {
    return Promise.resolve(typeof src === 'string' ? '' : new File([], ''));
  }

  if (typeof src === 'string') {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // 設定canvas參數
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_AREA = 16777216; // iOS canvas maximum area.
        let width = img.width;
        let height = img.height;

        if (width * height > MAX_AREA) {
          /** iOS canvas maximum area: (width * height > 16777216) */
          const scalar = Math.sqrt(MAX_AREA) / Math.sqrt(width * height);
          width = Math.floor(width * scalar);
          height = Math.floor(height * scalar);
          canvas.width = width;
          canvas.height = height;
          ctx?.fillRect(0, 0, canvas.width, canvas.height);
          ctx?.drawImage(img, 0, 0);
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
        }

        const compressImageAsync = (quality: number): Promise<Blob> => {
          return new Promise<Blob>((r) => {
            canvas.toBlob(
              (blob) => r(blob || new Blob()),
              'image/jpeg',
              quality,
            );
          });
        };

        const compressUntilSizeLessThan = async (
          quality: number,
          targetSize: number,
        ): Promise<Blob> => {
          return compressImageAsync(quality).then((blob) => {
            if (blob.size <= targetSize || quality <= 0.1) {
              return blob;
            } else {
              quality -= 0.1;
              return compressUntilSizeLessThan(quality, targetSize);
            }
          });
        };

        compressUntilSizeLessThan(0.7, maxMb * 1024 * 1024).then((blob) => {
          if (options?.log) {
            const resizedFile = new File([blob], 'temp', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            console.log(
              `Resized image size: ${(resizedFile.size / 1024).toFixed(2)} KB`,
            );
          }

          const afterCompressReader = new FileReader();
          afterCompressReader.onloadend = () => {
            const base64 = afterCompressReader.result as string;
            base64 ? resolve(base64) : reject(afterCompressReader.error);
            if (options?.log) {
              console.log('壓縮後的base64', base64);
            }
          };
          afterCompressReader.readAsDataURL(blob);
        });
      };
      img.onerror = (e) => {
        reject(new Error((e as Event)?.type));
      };
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = src;
    });
  }
  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const base64 = event.target?.result as string;
      compressImage(base64, maxMb, options)
        .then((compressedBase64) =>
          base64ToFile(compressedBase64, src.name, {
            type: src.type,
            lastModified: Date.now(),
          }),
        )
        .then((compressedFile) => resolve(compressedFile))
        .catch(reject);
    };
    reader.onerror = () => {
      if (options?.log) console.log('Error: ', reader.error);
      reject(reader.error);
    };
    reader.readAsDataURL(src);
  });
}

export interface FileOptions {
  type?: string;
  /** The last modified date of the file. `Default`: Date.now(). */
  lastModified?: number;
}

export async function base64ToFile(
  base64String: string,
  filename: string,
  options?: FileOptions,
) {
  return fetch(base64String, {})
    .then((res) => res.blob())
    .then((blob) => new File([blob], filename, options));
}

export function fileListToFiles<Input extends FileList | File>(
  fileList: Input,
): File[] {
  return Array.prototype.slice.call<FileList | File, [], File[]>(fileList);
}
