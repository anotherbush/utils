import { UseLocalStorage } from '@anotherbush/react';
import {
  getLocalStorageItem,
  hasLocalStorageItem,
  isBrowser,
  removeLocalStorageItem,
  setLocalStorageItem,
  watchLocalStorageItem,
} from '@anotherbush/utils';
import { useEffect, useRef, useState } from 'react';
import { filter, tap } from 'rxjs';
import { useHydrated } from './use-hydrated';

export interface UseNextLocalStorage<T> extends UseLocalStorage<T> {
  hydrated: boolean;
}

export function useLocalStorage<T>(
  key: string,
  fallback: T
): UseNextLocalStorage<T>;
export function useLocalStorage<T>(key: string): UseNextLocalStorage<T | null>;
export function useLocalStorage<T>(
  key: string,
  fallback?: T
): UseNextLocalStorage<T | null>;
export function useLocalStorage<T>(
  key: string,
  fallback?: T
): UseNextLocalStorage<T | null> {
  const fallbackRef = useRef(fallback);
  const hydrated = useHydrated();
  const [data, setData] = useState<T | null>(fallback ?? null);

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  useEffect(() => {
    if (!hydrated) return;

    if (hasLocalStorageItem(key)) {
      setData(getLocalStorageItem<T>(key, fallbackRef.current));
    }
    const sub = watchLocalStorageItem<T>(key, fallbackRef.current)
      .pipe(filter(isBrowser), tap(setData))
      .subscribe();
    return () => sub.unsubscribe();
  }, [key, hydrated]);

  const set = <TT extends T>(next: TT) => setLocalStorageItem(key, next);

  const remove = () => removeLocalStorageItem(key);

  return { data, hydrated, set, remove };
}
