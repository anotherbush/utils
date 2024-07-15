import type { Observable } from 'rxjs';

export interface HookResponse<T> {
  data: T;
}

export type ValueOfObservable<ObservableLike extends Observable<unknown>> =
  Awaited<ReturnType<ObservableLike['toPromise']>>;
