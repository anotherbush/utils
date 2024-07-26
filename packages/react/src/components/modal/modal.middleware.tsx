import {
  CSSProperties,
  FC,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { fromEvent, merge, mergeMap, Observable, tap, timer } from 'rxjs';
import {
  useHydrated,
  useIsomorphicLayoutEffect,
  useUnmount,
} from '../../hooks';
import { Overlay, OverlayStyle } from '../overlay';
import { ModalAnimation } from './typings';

type ModalControllerMiddlewareVoidFunction = () => void;

interface ModalControllerMiddlewareModalAnimation extends ModalAnimation {
  overlayPresentAnimationName: string;
  overlayDismissAnimationName: string;
  modalPresentAnimationName: string;
  modalDismissAnimationName: string;
}

export const ModalControllerMiddleware: FC<{
  id: string;
  animation: ModalControllerMiddlewareModalAnimation;
  className?: string;
  style?: Omit<
    CSSProperties,
    | 'animationFillMode'
    | 'animationDuration'
    | 'animationTimingFunction'
    | 'animationName'
  >;
  canDismiss?: boolean;
  backdropClassName?: string;
  backdropStyle?: Omit<
    OverlayStyle,
    | 'animationFillMode'
    | 'animationDuration'
    | 'animationTimingFunction'
    | 'animationName'
  >;
  disableBackdropDismiss?: boolean;
  onNotifiedToDismiss$: Observable<void>;
  onInit: ModalControllerMiddlewareVoidFunction;
  onViewInit: ModalControllerMiddlewareVoidFunction;
  onWillPresent: ModalControllerMiddlewareVoidFunction;
  onDidPresent: ModalControllerMiddlewareVoidFunction;
  onWillDismiss: ModalControllerMiddlewareVoidFunction;
  onDidDismiss: ModalControllerMiddlewareVoidFunction;
  onDestroy: ModalControllerMiddlewareVoidFunction;
  children: ReactNode;
}> = ({
  id,
  animation,
  backdropStyle,
  backdropClassName,
  children,
  className,
  disableBackdropDismiss = false,
  canDismiss = true,
  style,
  onInit,
  onViewInit,
  onDestroy,
  onDidDismiss,
  onDidPresent,
  onNotifiedToDismiss$,
  onWillDismiss,
  onWillPresent,
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
    if (!hydrated || startDismiss || disableBackdropDismiss || !canDismiss)
      return;

    const clickAway$ = timer(500).pipe(
      mergeMap(() =>
        merge(
          fromEvent(document, 'mousedown'),
          fromEvent(document, 'touchstart')
        )
      ),
      tap(() => {
        // click away
        setStartDismiss(true);
      })
    );

    const sub = clickAway$.subscribe();
    return () => sub.unsubscribe();
  }, [hydrated, startDismiss, disableBackdropDismiss, canDismiss]);

  useEffect(() => {
    if (!canDismiss) return;

    const startDismissSub = onNotifiedToDismiss$
      .pipe(
        tap(() => {
          setStartDismiss(true);
        })
      )
      .subscribe();
    return () => startDismissSub.unsubscribe();
  }, [canDismiss]);

  useUnmount(() => {
    onDestroy();
  });

  return (
    <Overlay
      className={backdropClassName}
      style={{
        ...backdropStyle,
        animationFillMode: 'forwards',
        animationDuration: startDismiss
          ? animation.dismissAnimationDuration
          : animation.presentAnimationDuration,
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
          ...style,
          animationFillMode: 'forwards',
          animationDuration: startDismiss
            ? animation.dismissAnimationDuration
            : animation.presentAnimationDuration,
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
