import {
  useIsomorphicLayoutEffect,
  useUnmount,
  useHydrated,
} from '../../hooks';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { fromEvent, merge, Observable, tap } from 'rxjs';
import { Overlay } from '../overlay';
import { ModalAnimation } from './typings';

type ModalControllerMiddlewareVoidFunction = () => void;

export const ModalControllerMiddleware: FC<{
  id: string;
  className?: string;
  onInit: ModalControllerMiddlewareVoidFunction;
  onViewInit: ModalControllerMiddlewareVoidFunction;
  onWillPresent: ModalControllerMiddlewareVoidFunction;
  onDidPresent: ModalControllerMiddlewareVoidFunction;
  onWillDismiss: ModalControllerMiddlewareVoidFunction;
  onDidDismiss: ModalControllerMiddlewareVoidFunction;
  onDestroy: ModalControllerMiddlewareVoidFunction;
  onNotifiedToDismiss$: Observable<void>;
  animation: ModalAnimation;
  children: ReactNode;
}> = ({
  id,
  children,
  className,
  onInit,
  onViewInit,
  onDestroy,
  onDidDismiss,
  onDidPresent,
  onNotifiedToDismiss$,
  onWillDismiss,
  onWillPresent,
  animation,
}) => {
  const idRef = useRef(id);
  const hydrated = useHydrated();
  const ref = useRef<HTMLDivElement | null>(null);
  const [startDismiss, setStartDismiss] = useState(false);

  /** onInit */
  useIsomorphicLayoutEffect(() => {
    onInit();
  }, []);

  /** onViewInit */
  useEffect(() => {
    onViewInit();
  }, []);

  useEffect(() => {
    if (!hydrated || startDismiss) return;

    const clickAway$ = merge(
      fromEvent(document, 'mousedown'),
      fromEvent(document, 'touchstart')
    ).pipe(
      tap(() => {
        // click away
        setStartDismiss(true);
      })
    );

    const sub = clickAway$.subscribe();
    return () => sub.unsubscribe();
  }, [hydrated, startDismiss]);

  useEffect(() => {
    const startDismissSub = onNotifiedToDismiss$
      .pipe(
        tap(() => {
          setStartDismiss(true);
        })
      )
      .subscribe();
    return () => startDismissSub.unsubscribe();
  }, []);

  useUnmount(() => {
    onDestroy();
  });

  return (
    <Overlay
      style={{
        animationFillMode: 'forwards',
        animationDuration: animation.animationDuration,
        animationTimingFunction: startDismiss
          ? animation.dismissAnimationTimingFunction
          : animation.presentAnimationTimingFunction,
        animationName: startDismiss
          ? animation.overlayDismissAnimationName
          : animation.overlayPresentAnimationName,
      }}
    >
      <div
        id={idRef.current}
        ref={ref}
        className={className}
        style={{
          backgroundColor: 'transparent',
          animationFillMode: 'forwards',
          animationDuration: animation.animationDuration,
          animationTimingFunction: startDismiss
            ? animation.dismissAnimationTimingFunction
            : animation.presentAnimationTimingFunction,
          animationName: startDismiss
            ? animation.modalDismissAnimationName
            : animation.modalPresentAnimationName,
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onAnimationStart={(e) => {
          if (e.animationName.includes(animation.modalPresentAnimationName)) {
            onWillPresent();
          } else if (
            e.animationName.includes(animation.modalDismissAnimationName)
          ) {
            onWillDismiss();
          }
        }}
        onAnimationEnd={(e) => {
          if (e.animationName.includes(animation.modalPresentAnimationName)) {
            onDidPresent();
          } else if (
            e.animationName.includes(animation.modalDismissAnimationName)
          ) {
            onDidDismiss();
          }
        }}
      >
        {children}
      </div>
    </Overlay>
  );
};
