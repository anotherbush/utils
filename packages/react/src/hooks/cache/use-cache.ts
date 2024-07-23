import { CacheVariant, LFUCache, LRUCache } from '@anotherbush/utils';
import { useEffect, useRef, useState } from 'react';
import { Subject, distinctUntilChanged, filter, map, tap } from 'rxjs';
import { useValueRef } from '../use-value-ref';

export function useCache<T>(
  variant: CacheVariant,
  key: string,
  initialValue?: T | null
) {
  const { current: variantRef } = useRef(variant);
  const initialValueRef = useValueRef(initialValue);

  const [data, _setData] = useState<T | null>(() => {
    if (initialValue !== undefined) return initialValue;
    if (variantRef === 'LRU') return getLRUCache<T>(key);
    if (variantRef === 'LFU') return getLFUCache<T>(key);
    return null;
  });

  /** Handle initial value (includes updating by key change) */
  useEffect(() => {
    if (initialValueRef.current !== undefined) {
      _setData(initialValueRef.current);
    } else if (variantRef === 'LRU' && hasLRUCache(key)) {
      _setData(getLRUCache<T>(key));
    } else if (variantRef === 'LFU' && hasLFUCache(key)) {
      _setData(getLFUCache<T>(key));
    }
  }, [key]);

  /** Handle change events */
  useEffect(() => {
    const watcher$ =
      variantRef === 'LFU' ? watchLFUCache$<T>(key) : watchLRUCache$<T>(key);
    const sub = watcher$.pipe(tap(_setData)).subscribe();
    return () => sub.unsubscribe();
  }, [key]);

  const hasData = (dataKey?: string) => {
    if (variantRef === 'LRU') return hasLRUCache(dataKey || key);
    if (variantRef === 'LFU') return hasLFUCache(dataKey || key);
    return false;
  };

  const setData = (value: T | null) => {
    if (value === null && variantRef === 'LRU') deleteLRUCache(key);
    else if (value === null && variantRef === 'LFU') deleteLFUCache(key);
    else if (value !== null && variantRef === 'LRU') setLRUCache(key, value);
    else if (value !== null && variantRef === 'LFU') setLFUCache(key, value);
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

export function setCacheCapacity(variant: CacheVariant, capacity: number) {
  switch (variant) {
    case 'LRU': {
      lruCache().setCapacity(capacity);
      break;
    }
    case 'LFU': {
      lfuCache().setCapacity(capacity);
      break;
    }
  }
}

export function destroyCache() {
  _lruCache = null;
  _lruEmitter$ = null;
  _lfuCache = null;
  _lfuEmitter$ = null;
}
