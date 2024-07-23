import { distinctUntilChanged, filter, map, Subject } from 'rxjs';
import { Cache } from './typings';

export class ObservableCache<
  Factory extends Cache<Key, Val>,
  Key = any,
  Val = any
> {
  private readonly _factory: Factory;
  private readonly _emitter$: Subject<Key>;

  constructor(factory: Factory) {
    this._factory = factory;
    this._emitter$ = new Subject<Key>();
  }

  public has(key: Key): boolean {
    return this._factory.has(key);
  }

  public readonly get = (key: Key): Val | null =>
    this._factory.get(key) || null;

  public set(key: Key, value: Val) {
    this._factory.set(key, value);
    this._emitter$.next(key);
  }

  public delete(key: Key) {
    this._factory.delete(key);
    this._emitter$.next(key);
  }

  public watch$(key: Key) {
    return this._emitter$.asObservable().pipe(
      filter((changedDataKey) => changedDataKey === key),
      map(() => this.get(key)),
      distinctUntilChanged()
    );
  }

  public setCapacity(nextCapacity: number) {
    this._factory.setCapacity(nextCapacity);
  }
}
