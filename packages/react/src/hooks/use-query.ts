import { stringifyId } from '@anotherbush/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  catchError,
  finalize,
  from,
  lastValueFrom,
  map,
  retry,
  RetryConfig,
  tap,
  timer,
} from 'rxjs';
import { HookResponse } from '../typings';
import { useCache } from './use-cache';

interface _UseQueryParams<Variables, Response> {
  errorResolver?: <T, Err extends Error = Error>(ex?: Err) => T;
  forceLoadingAsFetching?: boolean;
  logging?: boolean;
  mode?: 'cache' | 'no-cache';
  name: string;
  onComplete?(response: Response): void;
  onError?(ex: Error): void;
  request(variables: Variables): Promise<HookResponse<Response>>;
  retry?: Pick<RetryConfig, 'count' | 'delay'>;
  skip?: boolean;
  variables?: Variables;
}

export type UseQueryParams<Variables, Response> = Omit<
  _UseQueryParams<Variables, Response>,
  'request' | 'name'
>;

export function useQuery<Variables, Response, Err extends Error = Error>({
  errorResolver,
  forceLoadingAsFetching = false,
  logging = false,
  mode = 'cache',
  name,
  onComplete,
  onError,
  request,
  retry: _retry = { count: 0, delay: () => timer(1000) },
  skip = false,
  variables,
}: _UseQueryParams<Variables, Response>) {
  const refreshKey = useMemo(
    () => `${name}:${stringifyId(variables)}`,
    [variables, name]
  );
  const init = useRef(false);
  const prevRefreshKey = useRef<string>(refreshKey);
  const [data, setData, hasCache] = useCache<Response>(refreshKey);
  const [loading, setLoading] = useState(!skip && !data);
  const [error, setError] = useState<Err | null>(null);

  const query = useCallback(
    (_loading?: boolean): Promise<Response> => {
      setError(null);
      if (_loading) setLoading(true);
      return lastValueFrom(
        from(request(variables as Variables)).pipe(
          map((res) => res?.data),
          tap((nextData) => {
            onComplete?.(nextData);
            setData(nextData);
          }),
          retry(_retry),
          catchError((ex) => {
            const error = errorResolver
              ? errorResolver(ex)
              : ex?.response?.data;
            onError?.(ex);
            setError(error);
            throw ex;
          }),
          finalize(() => setLoading(false))
        )
      );
    },
    [refreshKey, _retry, errorResolver]
  );

  const initialize = async () => {
    prevRefreshKey.current = '';
    setData(null);
  };

  useEffect(() => {
    if (skip || init.current) return;
    if (mode === 'cache' && hasCache(refreshKey)) {
      init.current = true;
    }
    if (mode === 'no-cache' || !data) {
      const letLoading =
        mode === 'no-cache' || forceLoadingAsFetching || !hasCache(refreshKey);
      query(letLoading).then(() => (init.current = true));
    }
  }, [mode, skip]);

  useEffect(() => {
    if (skip || !init.current) return;
    if (mode === 'cache' && hasCache(refreshKey)) {
      if (logging) console.debug('hasCache', refreshKey);
    } else if (refreshKey !== prevRefreshKey.current || mode === 'no-cache') {
      prevRefreshKey.current = refreshKey;
      query(true);
    }
  }, [mode, refreshKey, skip]);

  return { data, loading, error, refetch: query, initialize } as const;
}
