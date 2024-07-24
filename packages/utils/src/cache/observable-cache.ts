import { distinctUntilChanged, filter, map, Observable, Subject } from 'rxjs';
import { ConstructorOf, ValidKey, WatchableObject } from '../typings';
import { Cache } from './typings';
import { isCache } from './is-cache';

/**
 * @description Extension of an cache that can observe its mutation events.
 */
export class ObservableCache<Key extends ValidKey = ValidKey, Val = any>
  implements WatchableObject<Cache<Key, Val>>
{
  private readonly _factory: Cache<Key, Val>;
  private readonly _emitter$: Subject<Key>;
  /**
   * @description Will operate on the passing instance.
   * ```ts
   * import { LRUCache } from '@anotherbush/utils';
   *
   * let lruCache = new LRUCache(20);
   *
   * lruCache = new ObservableCache(lruCache);
   * ```
   */
  constructor(instance: Cache<Key, Val>);
  /**
   * @description Will create and operate an instance of cache.
   * ```ts
   * import { LRUCache } from '@anotherbush/utils';
   *
   * const lruCache = new ObservableCache(LRUCache, 20);
   * ```
   */
  constructor(
    BlueprintOfCache: ConstructorOf<Cache<Key, Val>>,
    initialCapacity: number
  );
  constructor(
    instanceOrBlueprintOfCache:
      | Cache<Key, Val>
      | ConstructorOf<Cache<Key, Val>>,
    /**
     * @default 20
     */
    initialCapacity?: number
  );
  constructor(
    instanceOrBlueprintOfCache:
      | Cache<Key, Val>
      | ConstructorOf<Cache<Key, Val>>,
    initialCapacity?: number
  ) {
    this._factory = isCache<Key, Val>(instanceOrBlueprintOfCache)
      ? instanceOrBlueprintOfCache
      : new instanceOrBlueprintOfCache(initialCapacity ?? 20);
    this._emitter$ = new Subject<Key>();
  }

  public get size() {
    return this._factory.size;
  }

  public get capacity() {
    return this._factory.capacity;
  }

  public has(key: Key): boolean {
    return this._factory.has(key);
  }

  public readonly get = (key: Key) => this._factory.get(key);

  public set(key: Key, value: Val) {
    const removedKey = this._factory.set(key, value);
    /** Notify the removed node to update value. */
    if (removedKey !== undefined) {
      this._emitter$.next(removedKey);
    }
    this._emitter$.next(key);
    return removedKey;
  }

  public delete(key: Key) {
    const removedKey = this._factory.delete(key);
    if (removedKey !== undefined) {
      this._emitter$.next(removedKey);
    } else {
      this._emitter$.next(key);
    }
    return removedKey;
  }

  public watch(key: Key): Observable<Val | undefined> {
    return this._emitter$.asObservable().pipe(
      filter((changedDataKey) => changedDataKey === key),
      map(() => this.get(key)),
      distinctUntilChanged()
    );
  }

  public setCapacity(nextCapacity: number) {
    const truncatedKeys = this._factory.setCapacity(nextCapacity);
    /** Notify the truncated-node watchers to update their value.  */
    truncatedKeys.forEach((truncatedKey) => this._emitter$.next(truncatedKey));
    return truncatedKeys;
  }
}
