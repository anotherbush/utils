import {
  BehaviorSubject,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  map,
  Observable,
  shareReplay,
} from 'rxjs';
import { WatchableObject, ObjectType } from '../typings';
import { Store } from './typings';

/**
 * @description Extension of an store that can observe its mutation events.
 */
export class ObservableStore<T extends ObjectType>
  implements WatchableObject<Store<T>>
{
  private readonly _producer$: BehaviorSubject<T>;
  private readonly _consumer$: Observable<T>;

  public get value(): T {
    return this._producer$.value;
  }

  constructor(defaultValue: T) {
    this._producer$ = new BehaviorSubject<T>(defaultValue);
    /** Multicasting from a single broadcaster */
    this._consumer$ = this._producer$.asObservable().pipe(shareReplay(1));
  }

  public get(): T;
  public get<Key extends keyof T>(key: Key): T[Key];
  public get<Key extends keyof T>(key?: Key): T | T[Key];
  public get<Key extends keyof T>(key?: Key): T | T[Key] {
    return key === undefined
      ? this._producer$.value
      : this._producer$.value?.[key];
  }

  public set(dispatchAll: (prev: T) => T): void;
  public set<Key extends keyof T>(
    key: Key,
    dispatch: (prev: T[Key]) => T[Key]
  ): void;
  public set<KeyOrDisPatchAll extends keyof T | ((prev: T) => T)>(
    key: KeyOrDisPatchAll,
    dispatch: KeyOrDisPatchAll extends keyof T ? T[KeyOrDisPatchAll] : never
  ): void;
  public set<KeyOrDisPatchAll extends keyof T | ((prev: T) => T)>(
    key: KeyOrDisPatchAll,
    dispatch: KeyOrDisPatchAll extends keyof T
      ? (prev: T[KeyOrDisPatchAll]) => T[KeyOrDisPatchAll]
      : never
  ): void;
  public set<
    Key extends keyof T,
    KeyOrDisPatchAll extends Key | ((prev: T) => T)
  >(
    keyOrDisPatchAll: KeyOrDisPatchAll,
    dispatch?: KeyOrDisPatchAll extends Key
      ? T[Key] | ((prev: T[Key]) => T[Key])
      : never
  ): void {
    if (
      typeof keyOrDisPatchAll === 'string' &&
      typeof dispatch !== 'function'
    ) {
      /** dispatch by key */
      const key: string = keyOrDisPatchAll;
      const prevStore = this._producer$.value;
      const nextVal = dispatch;
      const nextStore = {
        ...prevStore,
        [key]: nextVal,
      };
      this._producer$.next(nextStore);
    } else if (
      typeof keyOrDisPatchAll === 'string' &&
      typeof dispatch === 'function'
    ) {
      /** dispatch by key */
      const key: string = keyOrDisPatchAll;
      const prevStore = this._producer$.value;
      const nextVal = dispatch(prevStore[key]);
      const nextStore = {
        ...prevStore,
        [key]: nextVal,
      };
      this._producer$.next(nextStore);
    } else if (typeof keyOrDisPatchAll === 'function') {
      /** dispatch all by patches */
      const patchAll: (prev: T) => T = keyOrDisPatchAll;
      const prevStore = this._producer$.value;
      const nextStore = patchAll(prevStore);
      this._producer$.next(nextStore);
    }
  }

  public watch(): Observable<T>;
  public watch<Key extends keyof T>(key: Key): Observable<T[Key]>;
  public watch<Key extends keyof T | undefined = undefined>(
    key?: Key
  ): Observable<any>;
  public watch<Key extends keyof T | undefined = undefined>(
    key?: Key
  ): Observable<any> {
    return key === undefined
      ? this._consumer$.pipe(distinctUntilChanged())
      : this._consumer$.pipe(
          distinctUntilKeyChanged(key),
          map((store) => store?.[key])
        );
  }
}
