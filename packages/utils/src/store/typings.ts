import { ObjectType } from '../typings';

export interface Store<T extends ObjectType> {
  get value(): T;
  get(): T;
  get<Key extends keyof T>(key: Key): T[Key];
  get<Key extends keyof T>(key?: Key): T | T[Key];
  set(dispatchAll: (prev: T) => T): void;
  set<Key extends keyof T>(key: Key, dispatch: (prev: T[Key]) => T[Key]): void;
  set<KeyOrDispatchAll extends keyof T | ((prev: T) => T)>(
    key: KeyOrDispatchAll,
    dispatch: KeyOrDispatchAll extends keyof T ? T[KeyOrDispatchAll] : never
  ): void;
  set<KeyOrDispatchAll extends keyof T | ((prev: T) => T)>(
    key: KeyOrDispatchAll,
    dispatch: KeyOrDispatchAll extends keyof T
      ? (prev: T[KeyOrDispatchAll]) => T[KeyOrDispatchAll]
      : never
  ): void;
}
