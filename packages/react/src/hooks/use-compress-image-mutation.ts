import {
  compressImage,
  CompressImageOptions,
  CompressImageSrc,
} from '@anotherbush/utils';
import { useMutation, UseMutationParams } from './use-mutation';

type UseCompressImageMutationSrc<T extends CompressImageSrc> = {
  src: T;
  /**
   * in bytes (based on blob.size)
   * 1 KB = 1024 bytes
   * 1 MB = 1024 * 1024 bytes
   * ...etc
   */
  maxSize: number;
  options?: CompressImageOptions;
};

export function useCompressImageMutation<
  AfterCompressSrc extends CompressImageSrc,
  BeforeCompressSrc extends UseCompressImageMutationSrc<AfterCompressSrc> = UseCompressImageMutationSrc<AfterCompressSrc>
>(
  options?: UseMutationParams<BeforeCompressSrc, AfterCompressSrc>
): ReturnType<typeof useMutation<BeforeCompressSrc, AfterCompressSrc>> {
  return useMutation<BeforeCompressSrc, AfterCompressSrc>({
    ...options,
    request: async ({ src, maxSize, options }) =>
      compressImage(src, maxSize, options).then((compressedSrc) => ({
        data: compressedSrc,
      })),
  });
}
