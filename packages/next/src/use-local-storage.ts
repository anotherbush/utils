'use client';

import {
  getLocalStorageItem,
  isBrowser,
  removeLocalStorageItem,
  setLocalStorageItem,
  watchLocalStorageItem,
} from '@anotherbush/utils';
import { useEffect, useState } from 'react';
import { filter, tap } from 'rxjs';

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
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    setData(getLocalStorageItem<T>(key, fallback));
    const sub = watchLocalStorageItem<T>(key, fallback)
      .pipe(filter(isBrowser), tap(setData))
      .subscribe();
    return () => sub.unsubscribe();
  }, [key, fallback]);

  const set = <TT extends T>(next: TT) => setLocalStorageItem(key, next);

  const remove = () => removeLocalStorageItem(key);

  return { data, set, remove };
}
