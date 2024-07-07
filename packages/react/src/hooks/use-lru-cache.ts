import { LRUCache } from '@anotherbush/utils';
import { useEffect, useState } from 'react';
import { Subject, distinctUntilChanged, filter, map, tap } from 'rxjs';

export function useLRUCache<T>(key: string) {
  const [data, _setData] = useState<T | null>(getCache<T>(key));

  useEffect(() => {
    if (hasCache(key)) {
      _setData(getCache<T>(key));
    }

    const sub = watchCache$<T>(key)
      .pipe(tap((newData) => _setData(newData)))
      .subscribe();

    return () => sub.unsubscribe();
  }, [key]);

  const hasData = (dataKey?: string) => hasCache(dataKey || key);

  const setData = (value: T | null) =>
    value === null ? deleteCache(key) : setCache(key, value);

  return [data, setData, hasData] as const;
}

/** ------------------------------------------------------------ */

let _cache: LRUCache<string, any> | null = null;
let _emitter$: Subject<string> | null = null;

function cache(capacity = 10) {
  _cache = _cache || new LRUCache<string, any>(capacity);
  return _cache;
}
function emitter$() {
  _emitter$ = _emitter$ || new Subject<string>();
  return _emitter$;
}

function getCache<T>(key: string): T | null {
  return cache().get(key) || null;
}

function hasCache(key: string): boolean {
  return cache().has(key);
}

function setCache(key: string, value: any) {
  cache().set(key, value);
  emitter$().next(key);
}

function deleteCache(key: string) {
  cache().delete(key);
  emitter$().next(key);
}

function watchCache$<T>(key: string) {
  return emitter$()
    .asObservable()
    .pipe(
      filter((k) => k === key),
      map(() => getCache<T>(key)),
      distinctUntilChanged()
    );
}

export function seLRUCacheCapacity(capacity: number) {
  cache().setCapacity(capacity);
}

export function destroyLRUCache() {
  _cache = null;
  _emitter$ = null;
}
