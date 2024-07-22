/** https://drafts.csswg.org/resize-observer/#resize-observer-interface */
export default function extractSize(
  entry: ResizeObserverEntry,
  boxProp: 'borderBoxSize' | 'contentBoxSize' | 'devicePixelContentBoxSize',
  // eslint-disable-next-line no-undef
  sizeType: keyof ResizeObserverSize
): number | undefined {
  if (!entry[boxProp]) {
    if (boxProp === 'contentBoxSize') {
      /** https://drafts.csswg.org/resize-observer/#create-and-populate-resizeobserverentry-h */
      return entry.contentRect[sizeType === 'inlineSize' ? 'width' : 'height'];
    }

    return undefined;
  }

  // A couple bytes smaller than calling Array.isArray() and just as effective here.
  return entry[boxProp][0]
    ? entry[boxProp][0][sizeType]
    : // TS complains about this, because the RO entry type follows the spec and does not reflect Firefox's current
      // behaviour of returning objects instead of arrays for `borderBoxSize` and `contentBoxSize`.
      // @ts-ignore
      entry[boxProp][sizeType];
}
