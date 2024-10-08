import { LFUCache, ObservableCache } from '@anotherbush/utils';
import { useObservableCache } from './use-observable-cache';

export function useV2LFUCache<T>(key: string, initialValue?: T | null) {
  return useObservableCache<string, T>(observableLFUCache(), key, initialValue);
}

/** ------------------------------------------------------------ */

let _observableLFUCache: ObservableCache<string, any> | null = null;
function observableLFUCache() {
  _observableLFUCache =
    _observableLFUCache || new ObservableCache(new LFUCache<string, any>(20));
  return _observableLFUCache;
}
