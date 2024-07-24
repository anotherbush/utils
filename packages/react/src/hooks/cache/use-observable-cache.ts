import { ObservableCache, ValidKey } from '@anotherbush/utils';
import { useEffect, useState } from 'react';
import { tap } from 'rxjs';
import { useValueRef } from '../use-value-ref';

export function useObservableCache<Key extends ValidKey, Val = any>(
  observableCache: ObservableCache<Key, Val>,
  key: Key,
  initialValue?: Val | null
) {
  const initialValueRef = useValueRef(initialValue);
  const observableCacheRef = useValueRef(observableCache);
  const [data, _setData] = useState<Val | null>(
    initialValue !== undefined ? initialValue : observableCache.get(key) ?? null
  );

  useEffect(() => {
    if (initialValueRef.current !== undefined) {
      _setData(initialValueRef.current);
    } else if (observableCacheRef.current.has(key)) {
      _setData(observableCacheRef.current.get(key) ?? null);
    }
  }, [key]);

  useEffect(() => {
    const sub = observableCacheRef.current
      .watch(key)
      .pipe(tap((nextData) => _setData(nextData ?? null)))
      .subscribe();
    return () => sub.unsubscribe();
  }, [key]);

  const hasData = (dataKey?: Key) =>
    observableCacheRef.current.has(dataKey || key);

  const setData = (value: Val | null) =>
    value === null
      ? observableCacheRef.current.delete(key)
      : observableCacheRef.current.set(key, value);

  return [data, setData, hasData] as const;
}
