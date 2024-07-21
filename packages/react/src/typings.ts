import { type BehaviorSubject, type Observable } from 'rxjs';

export interface HookResponse<T> {
  data: T;
}

export type ValueOfObservable<ObservableLike extends Observable<unknown>> =
  ObservableLike extends BehaviorSubject<any>
    ? ObservableLike['value']
    : Awaited<ReturnType<ObservableLike['toPromise']>>;
