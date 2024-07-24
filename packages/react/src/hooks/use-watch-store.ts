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
  const storeRef = useRef(store);
  const [data, setData] = useState(() => storeRef.current.get(key));

  useEffect(() => {
    /** initial data */
    setData(storeRef.current.get(key));

    /** watch data */
    const sub = storeRef.current.watch(key).pipe(tap(setData)).subscribe();
    return () => sub.unsubscribe();
  }, [key]);

  return data;
}
