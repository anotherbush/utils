import { useEffect, useState } from 'react';

export function useDebouncedVal<T>(val: T, debounceMs: number): T {
  const [debouncedVal, setDebouncedVal] = useState(val);

  useEffect(() => {
    const macroTask = setTimeout(() => {
      setDebouncedVal(val);
    }, debounceMs);

    return () => {
      clearTimeout(macroTask);
    };
  }, [val]);

  return debouncedVal;
}
