import {
  getLocalStorageItem,
  hasLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
  watchLocalStorageItem
} from '@anotherbush/utils';
import { useEffect, useRef, useState } from 'react';
import { tap } from 'rxjs';

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
  const fallbackRef = useRef(fallback);
  const [data, setData] = useState<T | null>(() =>
    getLocalStorageItem<T>(key, fallback)
  );

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  useEffect(() => {
    if (hasLocalStorageItem(key)) {
      setData(getLocalStorageItem<T>(key, fallbackRef.current));
    }
    const sub = watchLocalStorageItem<T>(key, fallbackRef.current)
      .pipe(tap(setData))
      .subscribe();
    return () => sub.unsubscribe();
  }, [key]);

  const set = <TT extends T>(next: TT) => setLocalStorageItem(key, next);

  const remove = () => removeLocalStorageItem(key);

  return { data, set, remove };
}
