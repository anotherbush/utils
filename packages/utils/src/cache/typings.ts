export type CacheVariant = 'LRU' | 'LFU';

export interface Cache<Key = any, Val = any> {
  size: number;
  capacity: number;
  get(key: Key): Val | undefined;
  set(key: Key, val: Val): void;
  has(key: Key): boolean;
  delete(key: Key): void;
  setCapacity(capacity: number): void;
}
