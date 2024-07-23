import { LRUCache, ObservableCache } from '@anotherbush/utils';
import { useObservableCache } from './use-observable-cache';

export function useV2LRUCache<T>(key: string, initialValue?: T | null) {
  return useObservableCache(observableLRUCache(), key, initialValue);
}

/** ------------------------------------------------------------ */

let _observableLRUCache: ObservableCache<LRUCache<string, any>> | null = null;
function observableLRUCache() {
  _observableLRUCache =
    _observableLRUCache || new ObservableCache(new LRUCache<string, any>(20));
  return _observableLRUCache;
}
