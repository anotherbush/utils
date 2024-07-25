import {
  allowBodyScroll,
  isBrowser,
  lockBodyScroll,
  uuid,
} from '@anotherbush/utils';
import { ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
  BehaviorSubject,
  filter,
  finalize,
  lastValueFrom,
  map,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { ModalControllerMiddleware } from './modal.middleware';
import { Modal, ModalConfig, ModalEvent, ModalEventDetail } from './typings';

export class ModalController {
  static readonly onNotifiedToDismiss$ = new Subject<string>();

  private readonly modalIdToRoot = new Map<string, Root>();

  constructor() {
    this._style();
  }

  /**
   * Customized your modal config here.
   * transition or overlaying props ?
   */
  public create<T>(config?: ModalConfig<T>): Modal<T> {
    /** Client side only */
    if (!isBrowser()) return this._empty();

    const modalId = uuid();
    const modalElement = document.createElement('div');
    const modalRoot = createRoot(modalElement);

    const event$ = new BehaviorSubject<ModalEvent<T>>(
      this._event({
        type: 'create',
        target: modalElement,
      })
    );
    const destroy$ = event$.asObservable().pipe(
      filter((e) => e.detail.type === 'destroy'),
      take(1)
    );
    const didPresent$ = new BehaviorSubject(false);

    const modal = {
      id: modalId,
      config,
      present: (children: (self: Modal<T>) => ReactNode) => {
        lockBodyScroll();
        this.modalIdToRoot.set(modalId, modalRoot);

        modalRoot.render(
          <ModalControllerMiddleware
            id={modalId}
            animation={{
              animationDuration: '0.3s',
              dismissAnimationTimingFunction: 'ease-out',
              presentAnimationTimingFunction: 'ease-in-out',
              ...config?.animation,
              overlayPresentAnimationName: 'modal-overlay-fade-in',
              overlayDismissAnimationName: 'modal-overlay-fade-out',
              modalPresentAnimationName: 'modal-fade-in',
              modalDismissAnimationName: 'modal-fade-out',
            }}
            onInit={() => {
              const initEvent = this._event<T>({
                type: 'init',
                target: modalElement,
              });
              event$.next(initEvent);
              config?.onInit?.(initEvent);
            }}
            onViewInit={() => {
              const viewInit = this._event<T>({
                type: 'view-init',
                target: modalElement,
              });
              event$.next(viewInit);
              config?.onViewInit?.(viewInit);
            }}
            onWillPresent={() => {
              const willPresentEvent = this._event<T>({
                type: 'will-present',
                target: modalElement,
              });
              event$.next(willPresentEvent);
              config?.onViewInit?.(willPresentEvent);
            }}
            onDidPresent={() => {
              const didPresentEvent = this._event<T>({
                type: 'did-present',
                target: modalElement,
              });
              didPresent$.next(true);
              event$.next(didPresentEvent);
              config?.onDidPresent?.(didPresentEvent);
            }}
            onWillDismiss={() => {
              const willDismissEvent = this._event<T>({
                type: 'will-dismiss',
                target: modalElement,
              });
              event$.next(willDismissEvent);
              config?.onWillDismiss?.(willDismissEvent);
            }}
            onDidDismiss={() => {
              const didDismissEvent = this._event<T>({
                type: 'did-dismiss',
                target: modalElement,
              });
              event$.next(didDismissEvent);
              config?.onDidDismiss?.(didDismissEvent);
              modalRoot.unmount();
            }}
            onDestroy={() => {
              const destroyEvent = this._event<T>({
                type: 'destroy',
                target: modalElement,
              });
              event$.next(destroyEvent);
              config?.onDestroy?.(destroyEvent);
            }}
            onNotifiedToDismiss$={ModalController.onNotifiedToDismiss$
              .asObservable()
              .pipe(
                filter((id) => id === modalId),
                take(1),
                map(() => undefined)
              )}
          >
            {typeof children === 'function' ? children(modal) : children}
          </ModalControllerMiddleware>
        );

        return event$.asObservable().pipe(takeUntil(destroy$));
      },
      dismiss: () => {
        /** You can dismiss a modal only if it has did present */
        return lastValueFrom(
          didPresent$.asObservable().pipe(
            filter((didPresent) => didPresent),
            take(1),
            switchMap(() => {
              /** Make true dismiss can emit after the event listener created. */
              queueMicrotask(() =>
                ModalController.onNotifiedToDismiss$.next(modalId)
              );
              return event$.asObservable();
            }),
            filter(
              (e) =>
                e.detail.type === 'will-dismiss' ||
                e.detail.type === 'did-dismiss' ||
                e.detail.type === 'destroy'
            ),
            takeUntil(destroy$),
            finalize(() => {
              this.modalIdToRoot.delete(modalId);
              if (this.modalIdToRoot.size === 0) {
                /** release the body scroll lock */
                allowBodyScroll();
              }
            })
          )
        );
      },
    };

    return modal;
  }

  private _style() {
    if (!isBrowser() || document.getElementById(MODAL_KEYFRAME_ID)) return;
    const style = document.createElement('style');
    style.id = MODAL_KEYFRAME_ID;
    style.setAttribute('type', 'text/css');
    style.innerHTML = MODAL_KEYFRAME_STR;
    document.getElementsByTagName('head')?.[0]?.appendChild(style);
  }

  private _event<T>(event: ModalEventDetail<T>): ModalEvent<T> {
    return new CustomEvent<ModalEventDetail<T>>(event.type, {
      bubbles: false,
      cancelable: false,
      composed: false,
      detail: event,
    });
  }

  private _empty<T>(config?: ModalConfig<T>): Modal<T> {
    return {
      id: uuid(),
      config,
      present: () => of(null),
      dismiss: () => Promise.resolve(null),
    };
  }
}

const MODAL_KEYFRAME_ID = '@anotherbush/react/modal-keyframes';

const MODAL_KEYFRAME_STR =
  '@keyframes modal-fade-in {\
  from {\
    opacity: 0;\
    transform: translateY(100vh);\
  }\
  to {\
    opacity: 1;\
    transform: translateY(0);\
  }\
}\
@keyframes modal-fade-out {\
  from {\
    opacity: 1;\
    transform: translateY(0);\
  }\
  to {\
    opacity: 0;\
    transform: translateY(100vh);\
  }\
}\
@keyframes modal-overlay-fade-in {\
  from {\
    opacity: 0;\
  }\
  to {\
    opacity: 1;\
  }\
}\
@keyframes modal-overlay-fade-out {\
  from {\
    opacity: 1;\
  }\
  to {\
    opacity: 0;\
  }\
}';
