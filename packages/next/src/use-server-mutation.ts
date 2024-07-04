/// <reference types="react-dom/canary" />

import { useLayoutEffect, useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import { Subject, filter, finalize, take, tap } from 'rxjs';

type _UseServerMutationParams<Variables, Response> = {
  onComplete?:
    | ((res: Response) => void)
    | ((res: Response) => Promise<unknown>);
  request(state: Response | null, payload: Variables): Promise<Response>;
};

export type UseServerMutationParams<Variables, Response> = Omit<
  _UseServerMutationParams<Variables, Response>,
  'request'
>;

/**
 * @see https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#server-side-validation-and-error-handling
 */
export function useServerMutation<Variables, Response>({
  onComplete,
  request: _request,
}: _UseServerMutationParams<Variables, Response>) {
  const [response, request] = useFormState(_request, null);
  const [loading, setLoading] = useState(false);
  const listener$ = useRef(new Subject<Response | null>());

  const serverAction = (payload: Variables) =>
    new Promise<Response>((resolve, reject) => {
      listener$.current
        .asObservable()
        .pipe(
          filter((res): res is NonNullable<Response> => res !== null),
          take(1),
          tap((res) => {
            onComplete?.(res);
            resolve(res);
          }),
          /** @todo handle error exception. */
          finalize(() => setLoading(false))
        )
        .subscribe();

      setLoading(true);
      request(payload);
    });

  useLayoutEffect(() => {
    listener$.current.next(response);
  }, [response]);

  return [serverAction, { loading }] as const;
}
