import { useEffect, useRef } from 'react';

export function useValueRef<T>(value: T) {
  const valueRef = useRef<T>(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  return valueRef;
}
