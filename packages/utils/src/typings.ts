import type { Observable } from 'rxjs';

export type ObjectType = { [key: string | symbol]: any };

export type ArrayType = { [key: number]: any };

export type ValidKey = string | number | symbol | object;

export type ConstructorOf<T> = { new (...args: any[]): T };

/**
 * Extension of an object that can observe its mutation events.
 */
export interface WatchableObject<T extends ObjectType> {
  /** Return a hot observable to receive mutation events. */
  watch<Key extends keyof T>(key: Key): Observable<T[Key]>;
  watch<Key extends keyof T>(key?: Key): Observable<T[Key] | undefined>;
}
