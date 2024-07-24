import { ValidKey } from '../typings';

export type CacheVariant = 'LRU' | 'LFU';

export interface Cache<Key extends ValidKey = ValidKey, Val = any> {
  size: number;
  capacity: number;
  get(key: Key): Val | undefined;
  /**
   * @returns Return the removed-key if it was auto removed.
   */
  set(key: Key, val: Val): Key | undefined;
  has(key: Key): boolean;
  /**
   * @returns Return the removed-key if key exist else undefined.
   */
  delete(key: Key): Key | undefined;
  /**
   * @returns Return the truncated-keys if it was forced to truncated.
   */
  setCapacity(capacity: number): Key[];
}
