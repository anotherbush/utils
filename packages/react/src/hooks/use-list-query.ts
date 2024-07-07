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

export interface ListRq {
  page: number;
  size: number;
}

interface _UseListQueryParams<
  Variables,
  Response extends Partial<HookResponse<unknown[] | null>>
> {
  errorResolver?: <T, Err extends Error = Error>(ex?: Err) => T;
  listRq: ListRq;
  name: string;
  cache?: 'LRU' | 'LFU';
  variables?: Variables;
  request(
    listRq: ListRq,
    variables: Variables
  ): Promise<HookResponse<Response>>;
  skip?: boolean;
  mode?: 'cache' | 'no-cache';
  forceLoadingAsFetching?: boolean;
  logging?: boolean;
  retry?: Pick<RetryConfig, 'count' | 'delay'>;
  onError?(ex: Error): void;
  onComplete?(response: Response): void;
}

export type UseListQueryParams<
  Variables,
  Response extends Partial<HookResponse<unknown[] | null>>
> = Omit<_UseListQueryParams<Variables, Response>, 'request' | 'name'>;

export function useListQuery<
  Variables,
  Response extends Partial<HookResponse<unknown[] | null>>,
  Err extends Error = Error
>({
  forceLoadingAsFetching = false,
  listRq,
  logging = false,
  mode = 'cache',
  cache = 'LRU',
  name,
  onComplete,
  onError,
  request,
  retry: _retry = { count: 0, delay: () => timer(1000) },
  skip = false,
  variables,
  errorResolver,
}: _UseListQueryParams<Variables, Response>) {
  const refreshKey = useMemo(
    () => `${name}:${stringifyId(variables)}`,
    [variables, name]
  );
  const init = useRef(false);
  const prevRefreshKey = useRef<string>(refreshKey);
  const [data, setData, hasCache] = useCache<Response>(cache, refreshKey);
  const [loading, setLoading] = useState(!skip && !data);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<Err | null>(null);

  const query = useCallback(
    (_loading?: boolean): Promise<Response> => {
      setError(null);
      if (_loading) setLoading(true);
      return lastValueFrom(
        from(request(listRq, variables as Variables)).pipe(
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
    [listRq, refreshKey, _retry, errorResolver]
  );

  const fetchMore = useCallback(
    (nextListRq: ListRq): Promise<Response> => {
      setError(null);
      setIsFetchingMore(true);
      return lastValueFrom(
        from(request(nextListRq, variables as Variables)).pipe(
          map((res) => res?.data),
          tap((nextData) => {
            if (Array.isArray(nextData?.data) && Array.isArray(data?.data)) {
              const nextDataData = [...data.data, ...nextData.data];
              // console.log(data?.data);
              // console.log(nextData?.data);
              // console.log(nextDataData);
              nextData.data = nextDataData;
            }

            onComplete?.(nextData);
            setData(nextData);
          }),
          catchError((ex) => {
            const error = errorResolver
              ? errorResolver(ex)
              : ex?.response?.data;
            onError?.(ex);
            setError(error);
            throw ex;
          }),
          finalize(() => setIsFetchingMore(false))
        )
      );
    },
    [data, refreshKey, _retry, errorResolver]
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

  return {
    data,
    loading,
    error,
    refetch: query,
    initialize,
    fetchMore,
    isFetchingMore,
  } as const;
}
