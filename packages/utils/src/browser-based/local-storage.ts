import {
  Observable,
  Subject,
  distinctUntilChanged,
  filter,
  map,
  startWith,
} from 'rxjs';
import { isBrowser } from './is-browser';

export const LOCAL_STORAGE_PREFIX = '@anotherbush/utils';

export function localStorage(): Storage | null {
  return isBrowser() ? window?.localStorage : null;
}

export function setLocalStorageItem(key: string, val: any) {
  try {
    const storage = localStorage();
    if (!storage) return;

    const storageKey = getLocalStorageKey(key);
    const storageStringVal = JSON.stringify(val);
    storage.setItem(storageKey, storageStringVal);
    emitter$().next(key);
    // eslint-disable-next-line no-empty
  } catch {}
}

export function getLocalStorageItem<T>(key: string, fallback: T): T;
export function getLocalStorageItem<T>(key: string): T | null;
export function getLocalStorageItem<T>(key: string, fallback?: T): T | null;
export function getLocalStorageItem<T>(key: string, fallback?: T): T | null {
  const emptyRes: T | null = fallback !== undefined ? fallback : null;
  try {
    const storage = localStorage();
    if (!storage) return emptyRes;
    const storageKey = getLocalStorageKey(key);
    const storageStringVal = storage.getItem(storageKey);
    if (typeof storageStringVal !== 'string') return emptyRes;
    return JSON.parse(storageStringVal) as T;
  } catch {
    return emptyRes;
  }
}

export function hasLocalStorageItem(key: string): boolean {
  try {
    const storage = localStorage();
    if (!storage) return false;
    const storageKey = getLocalStorageKey(key);
    const storageStringVal = storage.getItem(storageKey);
    return typeof storageStringVal === 'string';
  } catch {
    return false;
  }
}

export function removeLocalStorageItem(key: string): boolean {
  try {
    if (!hasLocalStorageItem(key)) return false;

    const storage = localStorage();
    if (!storage) return false;

    const storageKey = getLocalStorageKey(key);
    storage.removeItem(storageKey);
    emitter$().next(key);
    return true;
  } catch {
    return false;
  }
}

export function watchLocalStorageItem<T>(
  key: string,
  fallback: T
): Observable<T>;
export function watchLocalStorageItem<T>(key: string): Observable<T | null>;
export function watchLocalStorageItem<T>(
  key: string,
  fallback?: T
): Observable<T | null>;
export function watchLocalStorageItem<T>(
  key: string,
  fallback?: T
): Observable<T | null> {
  return emitter$()
    .asObservable()
    .pipe(
      startWith(getLocalStorageItem<T>(key) ?? fallback),
      filter((changedItemKey) => changedItemKey === key),
      map(() => getLocalStorageItem<T>(key)),
      distinctUntilChanged()
    );
}

/** --- private --- */

let _emitter$: Subject<string> | null = null;
function emitter$() {
  _emitter$ = _emitter$ || new Subject<string>();
  return _emitter$;
}

function getLocalStorageKey(key: string) {
  return `${LOCAL_STORAGE_PREFIX}:${key}`;
}
