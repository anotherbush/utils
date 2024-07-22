import type { Ref } from 'react';

export type ComposableRef<T> = Ref<T> | null | undefined;
export type ComposedRef<T> = Extract<Ref<T>, (...args: any[]) => any>;
export function composeRefs<T>(refs: ComposableRef<T>[]): ComposedRef<T> {
  return (element) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        // eslint-disable-next-line no-param-reassign
        (ref as { current: T | null }).current = element;
      }
    });
  };
}
