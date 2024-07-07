import { LFUCache, LRUCache } from '@anotherbush/utils';
import { useEffect, useRef, useState } from 'react';
import { Subject, distinctUntilChanged, filter, map, tap } from 'rxjs';

export function useCache<T>(cache: 'LRU' | 'LFU', key: string) {
  const { current: cacheRef } = useRef(cache);

  const [data, _setData] = useState<T | null>(() => {
    if (cacheRef === 'LRU') return getLRUCache<T>(key);
    if (cacheRef === 'LFU') return getLFUCache<T>(key);
    return null;
  });

  useEffect(() => {
    if (cacheRef === 'LRU') {
      if (hasLRUCache(key)) {
        _setData(getLRUCache<T>(key));
      }
      const sub = watchLRUCache$<T>(key).pipe(tap(_setData)).subscribe();
      return () => sub.unsubscribe();
    } else if (cacheRef === 'LFU') {
      if (hasLFUCache(key)) {
        _setData(getLFUCache<T>(key));
      }
      const sub = watchLFUCache$<T>(key).pipe(tap(_setData)).subscribe();
      return () => sub.unsubscribe();
    }
  }, [key]);

  const hasData = (dataKey?: string) => {
    if (cacheRef === 'LRU') return hasLRUCache(dataKey || key);
    if (cacheRef === 'LFU') return hasLFUCache(dataKey || key);
    return false;
  };

  const setData = (value: T | null) => {
    if (value === null && cacheRef === 'LRU') deleteLRUCache(key);
    else if (value === null && cacheRef === 'LFU') deleteLFUCache(key);
    else if (value !== null && cacheRef === 'LRU') setLRUCache(key, value);
    else if (value !== null && cacheRef === 'LFU') setLFUCache(key, value);
  };

  return [data, setData, hasData] as const;
}

/** ------------------------------------------------------------ */

let _lruCache: LRUCache<string, any> | null = null;
let _lruEmitter$: Subject<string> | null = null;

let _lfuCache: LFUCache<string, any> | null = null;
let _lfuEmitter$: Subject<string> | null = null;

function lruCache(capacity = 10) {
  _lruCache = _lruCache || new LRUCache<string, any>(capacity);
  return _lruCache;
}
function lruEmitter$() {
  _lruEmitter$ = _lruEmitter$ || new Subject<string>();
  return _lruEmitter$;
}

function lfuCache(capacity = 10) {
  _lfuCache = _lfuCache || new LFUCache<string, any>(capacity);
  return _lfuCache;
}
function lfuEmitter$() {
  _lfuEmitter$ = _lfuEmitter$ || new Subject<string>();
  return _lfuEmitter$;
}

function getLRUCache<T>(key: string): T | null {
  return lruCache().get(key) || null;
}

function getLFUCache<T>(key: string): T | null {
  return lfuCache().get(key) || null;
}

function hasLRUCache(key: string): boolean {
  return lruCache().has(key);
}

function hasLFUCache(key: string): boolean {
  return lfuCache().has(key);
}

function setLRUCache(key: string, value: any) {
  lruCache().set(key, value);
  lruEmitter$().next(key);
}

function setLFUCache(key: string, value: any) {
  lfuCache().set(key, value);
  lfuEmitter$().next(key);
}

function deleteLRUCache(key: string) {
  lruCache().delete(key);
  lruEmitter$().next(key);
}

function deleteLFUCache(key: string) {
  lfuCache().delete(key);
  lfuEmitter$().next(key);
}

function watchLRUCache$<T>(key: string) {
  return lruEmitter$()
    .asObservable()
    .pipe(
      filter((k) => k === key),
      map(() => getLRUCache<T>(key)),
      distinctUntilChanged()
    );
}

function watchLFUCache$<T>(key: string) {
  return lfuEmitter$()
    .asObservable()
    .pipe(
      filter((k) => k === key),
      map(() => getLFUCache<T>(key)),
      distinctUntilChanged()
    );
}

export function setLRUCapacity(capacity: number) {
  lruCache().setCapacity(capacity);
}

export function setLFUCapacity(capacity: number) {
  lfuCache().setCapacity(capacity);
}

export function destroyCache() {
  _lruCache = null;
  _lruEmitter$ = null;
  _lfuCache = null;
  _lfuEmitter$ = null;
}
