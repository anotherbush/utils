import { distinctUntilChanged, filter, map, Observable, Subject } from 'rxjs';
import { ConstructorOf, ValidKey } from '../typings';
import { Cache } from './typings';
import { isCache } from './is-cache';

export class ObservableCache<Key extends ValidKey = ValidKey, Val = any>
  implements Cache<Key, Val>
{
  private readonly _factory: Cache<Key, Val>;
  private readonly _emitter$: Subject<Key>;

  constructor(instance: Cache<Key, Val>);
  constructor(factory: ConstructorOf<Cache<Key, Val>>, initialCapacity: number);
  constructor(
    factoryOrInstance: Cache<Key, Val> | ConstructorOf<Cache<Key, Val>>,
    initialCapacity?: number
  ) {
    this._factory = isCache<Key, Val>(factoryOrInstance)
      ? factoryOrInstance
      : new factoryOrInstance(initialCapacity ?? 20);
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
