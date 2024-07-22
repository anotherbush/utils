export type ObservedSize = {
  width: number | undefined;
  height: number | undefined;
};

export type ResizeHandler = (size: ObservedSize) => void;

// forcing consumers to use a specific TS version.
export type ResizeObserverBoxOptions =
  | 'border-box'
  | 'content-box'
  | 'device-pixel-content-box';

declare global {
  interface ResizeObserverEntry {
    readonly devicePixelContentBoxSize: ReadonlyArray<ResizeObserverSize>;
  }
  interface ResizeObserverSize {
    readonly blockSize: number;
    readonly inlineSize: number;
  }
}

export type RoundingFunction = (n: number) => number;
