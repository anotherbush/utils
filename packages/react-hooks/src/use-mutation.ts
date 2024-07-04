import { useState } from 'react';
import { finalize, from, map, mergeMap } from 'rxjs';
import { HookResponse } from './typings';

type _UseMutationParams<Variables, Response> = {
  errorResolver?: <T, Err extends Error = Error>(ex?: Err) => T;
  onComplete?: (res: Response) => Promise<unknown>;
  request(variables: Variables): Promise<HookResponse<Response>>;
};

export type UseMutationParams<Variables, Response> = Omit<
  _UseMutationParams<Variables, Response>,
  'request'
>;

export function useMutation<Variables, Response, Err extends Error = Error>({
  errorResolver,
  onComplete,
  request,
}: _UseMutationParams<Variables, Response>) {
  const [finished, setFinished] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Err | null>(null);

  const mutate = (variables: Variables): Promise<Response> => {
    setError(null);
    setLoading(true);
    return new Promise<Response>((resolve, reject) => {
      from(request(variables))
        .pipe(
          mergeMap(
            async (res) =>
              onComplete?.(res?.data)
                ?.then(() => res)
                ?.catch(() => res) ?? res,
          ),
          map((res) => res?.data),
          finalize(() => setLoading(false)),
        )
        .subscribe({
          next: (next) => {
            setFinished((prev) => prev + 1);
            resolve(next);
          },
          error: (ex) => {
            const error = errorResolver
              ? errorResolver(ex)
              : ex?.response?.data;
            setError(error);
            reject(error);
          },
        });
    });
  };

  return [mutate, { finished, loading, error }] as const;
}
