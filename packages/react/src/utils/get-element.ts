import { isBrowser } from '@anotherbush/utils';
import type { RefObject } from 'react';

export type ElementGetter =
  | HTMLElement
  | (() => HTMLElement)
  | RefObject<HTMLElement | null>
  | null;

export function getElement(elementGetter?: ElementGetter): HTMLElement | null {
  if (elementGetter && isBrowser()) {
    if (elementGetter instanceof HTMLElement) {
      return elementGetter;
    }

    if (typeof elementGetter === 'function') {
      return elementGetter();
    }

    return elementGetter.current;
  }

  return null;
}
