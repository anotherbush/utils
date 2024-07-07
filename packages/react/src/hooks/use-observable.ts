import { useEffect, useState } from 'react';
import { Observable, tap } from 'rxjs';

export type ValueOfObservable<ObservableLike extends Observable<unknown>> =
  Awaited<ReturnType<ObservableLike['toPromise']>>;

/**
 * To use the value of the observable, and handling its life cycle.
 */
export function useObservable<ObservableLike extends Observable<unknown>>(
  observableLike$: ObservableLike
): ValueOfObservable<ObservableLike> {
  const [data, setData] = useState<ValueOfObservable<ObservableLike>>();
  useEffect(() => {
    const sub = observableLike$
      .pipe(
        tap((nextData) =>
          setData(nextData as ValueOfObservable<ObservableLike>)
        )
      )
      .subscribe();
    return () => sub.unsubscribe();
  }, [observableLike$]);
  return data as ValueOfObservable<ObservableLike>;
}
