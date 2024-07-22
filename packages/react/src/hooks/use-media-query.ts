import { useState } from 'react';
import { isServer } from '@anotherbush/utils';
import { fromEvent, tap } from 'rxjs';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** Hook options. */
type UseMediaQueryOptions = {
  /**
   * The default value to return if the hook is being run on the server.
   * @default false
   */
  defaultValue?: boolean;
  /**
   * If `true` (default), the hook will initialize reading the media query. In SSR, you should set it to `false`, returning `options.defaultValue` or `false` initially.
   * @default true
   */
  initializeWithValue?: boolean;
};

/**
 * @example
 * ```tsx
 * const isSmallScreen = useMediaQuery('(max-width: 600px)');
 * // Use `isSmallScreen` to conditionally apply styles or logic based on the screen size.
 * ```
 */
export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (isServer()) {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query);
    }
    return defaultValue;
  });

  // Handles the change event of the media query.
  function handleChange() {
    setMatches(getMatches(query));
  }

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    handleChange();

    const sub = fromEvent(matchMedia, 'change')
      .pipe(tap(handleChange))
      .subscribe();

    return () => sub.unsubscribe();
  }, [query]);

  return matches;
}
