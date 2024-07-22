import { useCallback, useState } from 'react';

/**
 * Represents the type for either a Map or an array of key-value pairs.
 * @template K - The type of keys in the map.
 * @template V - The type of values in the map.
 */
type MapOrEntries<K, V> = Map<K, V> | [K, V][];

/**
 * Represents the actions available to interact with the map state.
 * @template K - The type of keys in the map.
 * @template V - The type of values in the map.
 */
type UseMapActions<K, V> = {
  /** Set a key-value pair in the map. */
  set: (key: K, value: V) => void;
  /** Set all key-value pairs in the map. */
  setAll: (entries: MapOrEntries<K, V>) => void;
  /** Remove a key-value pair from the map. */
  remove: (key: K) => void;
  /** Reset the map to an empty state. */
  reset: Map<K, V>['clear'];
};

/**
 * Represents the return type of the `useMap` hook.
 * @template K - The type of keys in the map.
 * @template V - The type of values in the map.
 */
type UseMapReturn<K, V> = [
  Omit<Map<K, V>, 'set' | 'clear' | 'delete'>,
  UseMapActions<K, V>
];

export function useMap<K, V>(
  initialState: MapOrEntries<K, V> = new Map()
): UseMapReturn<K, V> {
  const [map, setMap] = useState(new Map(initialState));

  const actions: UseMapActions<K, V> = {
    set: useCallback((key, value) => {
      setMap((prev) => {
        const copy = new Map(prev);
        copy.set(key, value);
        return copy;
      });
    }, []),

    setAll: useCallback((entries) => {
      setMap(() => new Map(entries));
    }, []),

    remove: useCallback((key) => {
      setMap((prev) => {
        const copy = new Map(prev);
        copy.delete(key);
        return copy;
      });
    }, []),

    reset: useCallback(() => {
      setMap(() => new Map());
    }, []),
  };

  return [map, actions];
}
