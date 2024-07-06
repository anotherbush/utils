import { UseLocalStorage } from '@anotherbush/react';
import {
  getLocalStorageItem,
  isBrowser,
  removeLocalStorageItem,
  setLocalStorageItem,
  watchLocalStorageItem,
} from '@anotherbush/utils';
import { useEffect, useState } from 'react';
import { filter, tap } from 'rxjs';

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
  const [data, setData] = useState<T | null>(fallback ?? null);

  useEffect(() => {
    setData(getLocalStorageItem<T>(key, fallback));
    const sub = watchLocalStorageItem<T>(key, fallback)
      .pipe(filter(isBrowser), tap(setData))
      .subscribe();
    return () => sub.unsubscribe();
  }, [key]);

  const set = <TT extends T>(next: TT) => setLocalStorageItem(key, next);

  const remove = () => removeLocalStorageItem(key);

  return { data, set, remove };
}
