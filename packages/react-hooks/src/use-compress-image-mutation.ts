import { compressImage, CompressImageOptions } from '@anotherbush/utils';
import { useMutation, UseMutationParams } from './use-mutation';

type CompressImageSrc<T extends File | string> = {
  src: T;
  maxMb: number;
  options?: CompressImageOptions;
};

export function useCompressImageMutation<
  T extends File | string,
  Src extends CompressImageSrc<T> = CompressImageSrc<T>,
>(options?: UseMutationParams<Src, T>) {
  return useMutation<Src, T>({
    ...options,
    request: async ({ src, maxMb, options }) =>
      compressImage(src, maxMb, options).then((compressedSrc) => ({
        data: compressedSrc,
      })),
  });
}
