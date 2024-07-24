import {
  getLocalStorageItem,
  hasLocalStorageItem,
  isServer,
  removeLocalStorageItem,
  setLocalStorageItem,
  watchLocalStorageItem,
} from '@anotherbush/utils';
import { useEffect, useState } from 'react';
import { tap } from 'rxjs';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import { useValueRef } from './use-value-ref';

export type UseLocalStorage<T> = {
  data: T;
  set: <TT extends NonNullable<T>>(next: TT) => void;
  remove: () => void;
};

export function useLocalStorage<T>(
  key: string,
  fallback: T
): UseLocalStorage<T>;
export function useLocalStorage<T>(key: string): UseLocalStorage<T | null>;
export function useLocalStorage<T>(
  key: string,
  fallback?: T
): UseLocalStorage<T | null>;
export function useLocalStorage<T>(
  key: string,
  fallback?: T
): UseLocalStorage<T | null> {
  const fallbackRef = useValueRef(fallback);
  const [data, setData] = useState<T | null>(() =>
    isServer()
      ? fallbackRef.current ?? null
      : getLocalStorageItem<T>(key, fallback)
  );

  useIsomorphicLayoutEffect(() => {
    if (hasLocalStorageItem(key)) {
      setData(getLocalStorageItem<T>(key, fallbackRef.current));
    }
  }, [key]);

  useEffect(() => {
    const sub = watchLocalStorageItem<T>(key, fallbackRef.current)
      .pipe(tap(setData))
      .subscribe();
    return () => sub.unsubscribe();
  }, [key]);

  const set = <TT extends T>(next: TT) => setLocalStorageItem(key, next);

  const remove = () => removeLocalStorageItem(key);

  return { data, set, remove };
}
