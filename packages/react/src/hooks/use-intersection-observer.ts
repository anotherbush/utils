import { isBrowser } from '@anotherbush/utils';
import { MutableRefObject, RefObject, useEffect, useRef } from 'react';
import { useValueRef } from './use-value-ref';

interface IntersectionObserverInit {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useIntersectionObserver<
  ObserveRef extends MutableRefObject<any> | RefObject<unknown>
>(
  ref: ObserveRef,
  onEntryIntersect: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  const onEntryIntersectRef = useValueRef(onEntryIntersect);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    /** client side only */
    if (!isBrowser() || ref?.current instanceof Element === false) return;

    const observeElement = ref.current;

    observerRef.current = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach(onEntryIntersectRef.current);
      },
      options
    );

    observerRef.current.observe(observeElement);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [ref, options?.root, options?.rootMargin, options?.threshold]);
}
