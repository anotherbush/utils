import {
  BehaviorSubject,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  map,
  Observable,
  shareReplay,
} from 'rxjs';
import { ObjectType } from './typings';

export type ObservableStoreDispatchFn<
  T extends ObjectType,
  Key extends keyof T | undefined
> = Key extends keyof T ? (prev: T[Key]) => T[Key] : (prev: T) => T;

export class ObservableStore<T extends ObjectType> {
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

  public dispatch(patchAll: (prev: T) => T): void;
  public dispatch<Key extends keyof T>(
    key: Key,
    patch: (prev: T[Key]) => T[Key]
  ): void;
  public dispatch<KeyOrPathAll extends keyof T | ((prev: T) => T)>(
    key: KeyOrPathAll,
    patch: KeyOrPathAll extends keyof T ? T[KeyOrPathAll] : never
  ): void;
  public dispatch<KeyOrPathAll extends keyof T | ((prev: T) => T)>(
    key: KeyOrPathAll,
    patch: KeyOrPathAll extends keyof T
      ? (prev: T[KeyOrPathAll]) => T[KeyOrPathAll]
      : never
  ): void;
  public dispatch<
    Key extends keyof T,
    KeyOrPathAll extends Key | ((prev: T) => T)
  >(
    keyOrPatchAll: KeyOrPathAll,
    patch?: KeyOrPathAll extends Key
      ? T[Key] | ((prev: T[Key]) => T[Key])
      : never
  ): void {
    if (typeof keyOrPatchAll === 'string' && typeof patch !== 'function') {
      /** dispatch by key */
      const key: string = keyOrPatchAll;
      const prevStore = this._producer$.value;
      const nextVal = patch;
      const nextStore = {
        ...prevStore,
        [key]: nextVal,
      };
      this._producer$.next(nextStore);
    } else if (
      typeof keyOrPatchAll === 'string' &&
      typeof patch === 'function'
    ) {
      /** dispatch by key */
      const key: string = keyOrPatchAll;
      const prevStore = this._producer$.value;
      const nextVal = patch(prevStore[key]);
      const nextStore = {
        ...prevStore,
        [key]: nextVal,
      };
      this._producer$.next(nextStore);
    } else if (typeof keyOrPatchAll === 'function') {
      /** dispatch all by patches */
      const patchAll: (prev: T) => T = keyOrPatchAll;
      const prevStore = this._producer$.value;
      const nextStore = patchAll(prevStore);
      this._producer$.next(nextStore);
    }
  }

  /** Return a hot observable */
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
