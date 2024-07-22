import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

export function useValueRef<T>(value: T) {
  const valueRef = useRef<T>(value);
  useIsomorphicLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);
  return valueRef;
}
