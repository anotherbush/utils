import { getBrowserScrollbarWidth } from './get-browser-scrollbar-width';
import { isBrowser } from './is-browser';

export function lockBodyScroll() {
  if (!isBrowser()) return;

  const { scrollY } = window;

  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;

  // Calculate scroll bar width and use padding-right to remain layout width.
  const scrollbarWidth = getBrowserScrollbarWidth();

  document.body.style.paddingRight = `${scrollbarWidth}px`;
  document.body.style.overflow = 'hidden';
}

export function allowBodyScroll() {
  if (!isBrowser()) return;

  const scrollY = Number((document.body.style?.top ?? '0').replace(/px/gi, ''));

  if (document.body.style.position === 'fixed') {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
    window.scrollTo(0, (scrollY || 0) * -1);
  }
}
