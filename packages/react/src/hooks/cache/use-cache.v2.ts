import {
  CacheVariant,
  LFUCache,
  LRUCache,
  ObservableCache,
} from '@anotherbush/utils';
import { useRef } from 'react';
import { useObservableCache } from './use-observable-cache';

export function useV2Cache<T>(
  variant: CacheVariant,
  key: string,
  initialValue?: T | null
) {
  const { current: variantRef } = useRef(variant);
  const observableCache =
    variantRef === 'LFU' ? observableLFUCache() : observableLRUCache();
  return useObservableCache(observableCache, key, initialValue);
}

let _observableLRUCache: ObservableCache<LRUCache<string, any>> | null = null;
function observableLRUCache() {
  _observableLRUCache =
    _observableLRUCache || new ObservableCache(new LRUCache<string, any>(20));
  return _observableLRUCache;
}

let _observableLFUCache: ObservableCache<LFUCache<string, any>> | null = null;
function observableLFUCache() {
  _observableLFUCache =
    _observableLFUCache || new ObservableCache(new LFUCache<string, any>(20));
  return _observableLFUCache;
}
