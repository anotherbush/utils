import type { ObservableStore } from '@anotherbush/utils';
import { useEffect, useRef, useState } from 'react';
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
    /** initial data */
    setData(store.get(key));

    /** watch data */
    const sub = store.watch(key).pipe(tap(setData)).subscribe();
    return () => sub.unsubscribe();
  }, [store, key]);

  return data;
}
