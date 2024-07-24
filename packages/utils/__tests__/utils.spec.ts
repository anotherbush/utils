import { LFUCache, LRUCache, ObservableCache } from '@anotherbush/utils';
import { skip, take, tap } from 'rxjs';
import { ObservableStore } from '../src/observable-store';

describe('ObservableStore', () => {
  interface MyClientStoreValue {
    loading: boolean;
    name: string;
    optionalField?: object;
  }
  const store = new ObservableStore<MyClientStoreValue>({
    loading: false,
    name: 'Tim',
  });

  expect(store.value).toEqual({
    loading: false,
    name: 'Tim',
  });

  let watchAllUntilChangeOneTimeReceived = 0;
  store
    .watch()
    .pipe(take(2))
    .subscribe((client) => {
      ++watchAllUntilChangeOneTimeReceived;
      if (watchAllUntilChangeOneTimeReceived === 1) {
        expect(client).toEqual({
          loading: false,
          name: 'Tim',
        });
      } else if (watchAllUntilChangeOneTimeReceived === 2) {
        expect(client).toEqual({
          loading: false,
          name: 'Amy',
        });
      } else {
        expect(watchAllUntilChangeOneTimeReceived).toEqual(2);
      }
    });

  store.dispatch('name', (prevName) => {
    expect(prevName).toEqual('Tim');
    return 'Amy';
  });

  store
    .watch('name')
    .pipe(skip(1), take(1))
    .subscribe((nextName) => {
      expect(nextName).toEqual('Bob');
    });

  store.dispatch('name', (prevName) => {
    expect(prevName).toEqual('Amy');
    return 'Bob';
  });

  store
    .watch('optionalField')
    .pipe(skip(1), take(1))
    .subscribe((nextOptionalField) => {
      expect(nextOptionalField).toEqual({ dynamicallyPatched: ':)' });
    });

  store.dispatch('optionalField', (prevOptionalField) => {
    expect(prevOptionalField).toBeUndefined();
    return { dynamicallyPatched: ':)' };
  });

  store
    .watch('name')
    .pipe(skip(1), take(1))
    .subscribe((nextName) => {
      expect(nextName).toEqual('John');
    });

  store.dispatch((prev) => ({
    ...prev,
    name: 'John',
  }));

  expect(store.get()).toEqual({
    loading: false,
    name: 'John',
    optionalField: { dynamicallyPatched: ':)' },
  });

  store
    .watch('name')
    .pipe(skip(1), take(1))
    .subscribe((nextName) => {
      expect(nextName).toEqual('TimChen');
    });

  store.dispatch('name', 'TimChen');
});

describe('ObservableCache', () => {
  /** ObservableCache with constructor */
  it('ObservableCache with constructor', () => {
    const objectRef1: never[] = [];
    const cache$ = new ObservableCache<Array<any>, number>(LRUCache, 2);

    expect(cache$).toBeInstanceOf(ObservableCache);

    cache$.set(objectRef1, 1);

    expect(cache$.has(objectRef1)).toBeTruthy();
    expect(cache$.get(objectRef1)).toEqual(1);
    expect(cache$.size).toEqual(1);
    expect(cache$.capacity).toEqual(2);

    expect(cache$).toHaveProperty<ObservableCache>(
      'capacity' as keyof ObservableCache
    );
    expect(cache$).toHaveProperty<ObservableCache>(
      'size' as keyof ObservableCache
    );
    expect(cache$).toHaveProperty<ObservableCache>(
      'delete' as keyof ObservableCache
    );
    expect(cache$).toHaveProperty<ObservableCache>(
      'get' as keyof ObservableCache
    );
    expect(cache$).toHaveProperty<ObservableCache>(
      'has' as keyof ObservableCache
    );
    expect(cache$).toHaveProperty<ObservableCache>(
      'set' as keyof ObservableCache
    );
    expect(cache$).toHaveProperty<ObservableCache>(
      'setCapacity' as keyof ObservableCache
    );
    expect(cache$).toHaveProperty<ObservableCache>(
      'watch' as keyof ObservableCache
    );

    expect(cache$.size).toEqual(1);
  });

  /** LRUCache */
  it('LRUCache', () => {
    const lruCache = new LRUCache<'1' | '2', number>(10);
    const lruCache$ = new ObservableCache(lruCache);

    expect(lruCache$.has('1')).toBeFalsy();

    lruCache$
      .watch('1')
      .pipe(
        take(1),
        tap((val) => {
          expect(val).toEqual(1);
        })
      )
      .subscribe();

    lruCache$.set('1', 1);

    expect(lruCache$.has('1')).toBeTruthy();
    expect(lruCache$.get('1')).toEqual(1);
  });

  /** LFUCache */
  it('LFUCache', () => {
    const lfuCache = new LFUCache<'1' | '2', number>(1);
    const lfuCache$ = new ObservableCache(lfuCache);

    expect(lfuCache$).toBeInstanceOf(ObservableCache);

    expect(lfuCache$.has('1')).toBeFalsy();

    lfuCache$
      .watch('1')
      .pipe(
        take(1),
        tap((val) => {
          expect(val).toEqual(1);
        })
      )
      .subscribe();

    lfuCache$.set('1', 1);

    expect(lfuCache$.has('1')).toBeTruthy();
    expect(lfuCache$.get('1')).toEqual(1);

    const watchKey1Cb = (val: number | undefined) => {
      // console.log('1', val);
      /** be truncated out by Key2 set to 2 */
      expect(val).toBeUndefined();
    };
    const spiedWatchKey1Cb = jest.fn(watchKey1Cb);
    lfuCache$.watch('1').pipe(take(1)).subscribe(watchKey1Cb);
    jest.fn(() => {
      expect(spiedWatchKey1Cb).toHaveBeenCalled();
      expect(spiedWatchKey1Cb).toHaveBeenCalledTimes(1);
    });

    const watchKey2Cb = (val: number | undefined) => {
      // console.log('watchKey2Cb', val);
      expect(val).toEqual(2);
    };
    const spiedWatchKey2Cb = jest.fn(watchKey2Cb);
    lfuCache$.watch('2').pipe(take(1), tap(watchKey2Cb)).subscribe();
    lfuCache$.set('2', 2);
    jest.fn(() => {
      expect(spiedWatchKey2Cb).toHaveBeenCalled();
      expect(spiedWatchKey2Cb).toHaveBeenCalledTimes(1);
    });

    expect(lfuCache$.size).toEqual(1);
  });
});
