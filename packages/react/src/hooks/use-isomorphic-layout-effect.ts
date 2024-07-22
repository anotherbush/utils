import { isBrowser } from '@anotherbush/utils';
import { useEffect, useLayoutEffect } from 'react';

export const useIsomorphicLayoutEffect = isBrowser()
  ? useLayoutEffect
  : useEffect;
