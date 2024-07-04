import { useEffect, useState } from 'react';
import { Observable, tap } from 'rxjs';

/**
 * To use the value of the observable, and handling its life cycle.
 */
export function useObservable<ObservableLike extends Observable<unknown>>(
  observableLike$: ObservableLike,
): Awaited<ReturnType<ObservableLike['toPromise']>> {
  const [data, setData] =
    useState<Awaited<ReturnType<ObservableLike['toPromise']>>>();
  useEffect(() => {
    const sub = observableLike$
      .pipe(
        tap((nextData) =>
          setData(nextData as Awaited<ReturnType<ObservableLike['toPromise']>>),
        ),
      )
      .subscribe();
    return () => sub.unsubscribe();
  }, [observableLike$]);
  return data as Awaited<ReturnType<ObservableLike['toPromise']>>;
}
