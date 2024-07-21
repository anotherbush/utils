import { useEffect, useRef, useState } from 'react';
import {
  BehaviorSubject,
  filter,
  mergeMap,
  scan,
  takeUntil,
  takeWhile,
  tap,
  timer,
} from 'rxjs';

/**
 * @returns milliseconds
 */
export function useCanResendUntil(nextCanResendTimeStamp?: number) {
  const hasInit = useRef<number | string>();
  const canResend$ = useRef<BehaviorSubject<number | null>>(
    new BehaviorSubject<number | null>(null),
  );
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isCounting, setIsCounting] = useState(false);

  const restart = (nextCanResendTimeStamp: number) => {
    const ms = nextCanResendTimeStamp - Date.now();
    if (ms < 0) return;
    setCountdown(Math.floor(ms));
    setCanResend(false);
    setIsCounting(true);
    canResend$.current.next(ms);
  };

  useEffect(() => {
    const sub = canResend$.current
      .asObservable()
      .pipe(
        filter((ts): ts is number => typeof ts === 'number'),
        mergeMap((ts) =>
          timer(0, 1000).pipe(
            scan((acc) => (acc -= 1000), ts),
            takeWhile((x) => x >= 0),
            tap((_countdown) => {
              setCountdown(Math.floor(_countdown));
            }),
            takeUntil(
              canResend$.current
                .asObservable()
                .pipe(filter((ts) => ts === null)),
            ),
          ),
        ),
      )
      .subscribe();

    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      canResend$.current.next(null);
      setCanResend(true);
      setIsCounting(false);
    }
  }, [countdown]);

  useEffect(() => {
    if (hasInit.current === nextCanResendTimeStamp) return;
    if (nextCanResendTimeStamp !== undefined) {
      hasInit.current = nextCanResendTimeStamp;
      restart(nextCanResendTimeStamp);
    }
  }, [nextCanResendTimeStamp]);

  return { countdown, canResend, restart, isCounting } as const;
}
