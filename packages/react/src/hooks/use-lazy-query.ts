import { useCallback, useState } from 'react';
import { finalize, from, map } from 'rxjs';
import { HookResponse } from '../typings';

type _UseLazyQueryParams<Variables, Response> = {
  errorResolver?: <T, Err extends Error = Error>(ex?: Err) => T;
  onComplete?(response: Response): void;
  onError?(ex: Error): void;
  request(variables: Variables): Promise<HookResponse<Response>>;
  skip?: boolean;
};

export type UseLazyQueryParams<Variables, Response> = Omit<
  _UseLazyQueryParams<Variables, Response>,
  'request'
>;

export function useLazyQuery<Variables, Response, Err extends Error = Error>({
  errorResolver,
  onComplete,
  onError,
  request,
  skip = false,
}: _UseLazyQueryParams<Variables, Response>) {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<Err | null>(null);

  const query = useCallback(
    (rq?: Variables): Promise<Response> => {
      setError(null);
      setLoading(true);
      return new Promise((resolve, reject) => {
        from(request(rq as Variables))
          .pipe(
            map((res) => res?.data),
            finalize(() => setLoading(false))
          )
          .subscribe({
            next: (nextData) => {
              onComplete?.(nextData);
              setData(nextData);
              resolve(nextData);
            },
            error: (ex) => {
              const error = errorResolver
                ? errorResolver(ex)
                : ex?.response?.data;
              onError?.(ex);
              setError(error);
              reject(error);
            },
          });
      });
    },
    [request, onComplete, onError]
  );

  return [query, { data, loading, error, refetch: query } as const] as const;
}
