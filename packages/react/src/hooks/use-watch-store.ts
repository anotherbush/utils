import type { ObservableStore } from '@anotherbush/utils';
import { useEffect, useState } from 'react';
import { tap } from 'rxjs';

export function useWatchStore<
  Store extends ObservableStore<any>,
  T extends Store['value']
>(store: Store): T;
export function useWatchStore<
  Store extends ObservableStore<any>,
  T extends Store['value'],
  Key extends keyof T
>(store: Store, key: Key): T[Key];
export function useWatchStore<
  Store extends ObservableStore<any>,
  T extends Store['value'],
  Key extends keyof T
>(store: Store, key?: Key): T | T[Key] {
  const [data, setData] = useState(() => store.get(key));

  useEffect(() => {
    setData(store.get(key));
    const sub = store.watch(key).pipe(tap(setData)).subscribe();
    return () => sub.unsubscribe();
  }, [key]);

  return data;
}
