import { isBrowser } from '@anotherbush/utils';
import { useEffect, useState } from 'react';

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (isBrowser()) {
      setHydrated(true);
    }
  }, []);
  return hydrated;
}
