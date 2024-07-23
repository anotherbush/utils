import { Cache, ObservableCache } from '@anotherbush/utils';
import { useEffect, useState } from 'react';
import { tap } from 'rxjs';
import { useValueRef } from '../use-value-ref';

export function useObservableCache<
  Factory extends ObservableCache<Cache<Key, Val>>,
  Key = any,
  Val = any
>(observableCache: Factory, key: Key, initialValue?: Val | null) {
  const initialValueRef = useValueRef(initialValue);
  const observableCacheRef = useValueRef(observableCache);
  const [data, _setData] = useState(
    initialValue !== undefined ? initialValue : observableCache.get(key)
  );

  useEffect(() => {
    if (initialValueRef.current !== undefined) {
      _setData(initialValueRef.current);
    } else if (observableCacheRef.current.has(key)) {
      _setData(observableCacheRef.current.get(key));
    }
  }, [key]);

  useEffect(() => {
    const sub = observableCacheRef.current
      .watch$(key)
      .pipe(tap(_setData))
      .subscribe();
    return () => sub.unsubscribe();
  }, [key]);

  const hasData = (dataKey?: string) =>
    observableCacheRef.current.has(dataKey || key);

  const setData = (value: Val | null) =>
    value === null
      ? observableCacheRef.current.delete(key)
      : observableCacheRef.current.set(key, value);

  return [data, setData, hasData] as const;
}
