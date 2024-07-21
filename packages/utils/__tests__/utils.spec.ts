import { skip, take } from 'rxjs';
import { stringifyId } from '@anotherbush/utils';
import { ObservableStore } from '../src/observable-store';

it('ObservableStore', () => {
  interface MyClientStoreValue {
    loading: boolean;
    name: string;
    optionalField?: object;
  }
  const store = new ObservableStore<MyClientStoreValue>({
    loading: false,
    name: 'Tim',
  });

  expect(
    stringifyId(store.value) ===
      stringifyId({
        loading: false,
        name: 'Tim',
      })
  ).toBe(true);

  let watchAllUntilChangeOneTimeReceived = 0;
  store
    .watch()
    .pipe(take(2))
    .subscribe((client) => {
      ++watchAllUntilChangeOneTimeReceived;
      if (watchAllUntilChangeOneTimeReceived === 1) {
        expect(
          stringifyId(client) ===
            stringifyId({
              loading: false,
              name: 'Tim',
            })
        ).toBe(true);
      } else if (watchAllUntilChangeOneTimeReceived === 2) {
        expect(
          stringifyId(client) ===
            stringifyId({
              loading: false,
              name: 'Amy',
            })
        ).toBe(true);
      } else {
        expect(false).toBe(true);
      }
    });

  store.dispatch('name', (prevName) => {
    expect(prevName === 'Tim').toBe(true);
    return 'Amy';
  });

  const watchNameOnChange = store
    .watch('name')
    .pipe(skip(1), take(1))
    .subscribe((nextName) => {
      expect(nextName === 'Bob').toBe(true);
    });

  store.dispatch('name', (prevName) => {
    expect(prevName === 'Amy').toBe(true);
    return 'Bob';
  });

  const watchOptionalFieldOnChange = store
    .watch('optionalField')
    .pipe(skip(1), take(1))
    .subscribe((nextOptionalField) => {
      expect(
        stringifyId(nextOptionalField) ===
          stringifyId({ dynamicallyPatched: ':)' })
      ).toBe(true);
    });

  store.dispatch('optionalField', (prevOptionalField) => {
    expect(prevOptionalField === undefined).toBe(true);
    return { dynamicallyPatched: ':)' };
  });

  store
    .watch('name')
    .pipe(skip(1), take(1))
    .subscribe((nextName) => {
      expect(nextName === 'John').toBe(true);
    });

  store.dispatch((prev) => ({
    ...prev,
    name: 'John',
  }));

  expect(
    stringifyId(store.get()) ===
      stringifyId({
        loading: false,
        name: 'John',
        optionalField: { dynamicallyPatched: ':)' },
      })
  ).toBe(true);
});
