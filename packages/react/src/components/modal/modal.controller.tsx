import {
  allowBodyScroll,
  isBrowser,
  lockBodyScroll,
  uuid,
} from '@anotherbush/utils';
import { createRoot, Root } from 'react-dom/client';
import {
  BehaviorSubject,
  defaultIfEmpty,
  filter,
  finalize,
  lastValueFrom,
  map,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { ModalControllerMiddleware } from './modal.middleware';
import { Modal, ModalConfig, ModalEvent, ModalEventDetail } from './typings';

export interface ModalController {
  /**
   * Customized your modal config here.
   * transition or backdrop props ?
   */
  present<T>(config: ModalConfig<T>): Promise<ModalEventDetail<T>>;
}

export function createModalController(): ModalController {
  return new ModalControllerImpl();
}

class ModalControllerImpl implements ModalController {
  private readonly modalIdToRoot = new Map<string, Root>();

  constructor() {
    this._style();
  }

  /**
   * Customized your modal config here.
   * transition or backdrop props ?
   */
  public present<T>(config: ModalConfig<T>): Promise<ModalEventDetail<T>> {
    /** Client side only */
    if (!isBrowser())
      return Promise.resolve({
        type: 'ssr-ignored',
      });

    lockBodyScroll();
    const modalId = uuid();
    const modalElement = document.createElement('div');
    const modalRoot = createRoot(modalElement);
    this.modalIdToRoot.set(modalId, modalRoot);

    const event$ = new BehaviorSubject<ModalEvent<T>>(
      this._event({
        type: 'undefined',
      })
    );
    const destroy$ = event$.asObservable().pipe(
      filter((e) => e.detail.type === 'destroy'),
      take(1)
    );
    const didPresent$ = event$.asObservable().pipe(
      filter((e) => e.detail.type === 'did-present'),
      take(1)
    );
    const response$ = new BehaviorSubject<ModalEventDetail<T>>({
      type: 'abort',
    });

    const onNotifiedToDismiss$ = new Subject<void>();

    const modal: Modal<T> = {
      id: modalId,
      config,
      dismiss: (isSuccess, dismissOptions) => {
        /** You can dismiss a modal only if it has did present */
        return lastValueFrom(
          didPresent$.pipe(
            switchMap(() => {
              /** Make true emit after the event listener created. */
              queueMicrotask(() => {
                /** update the data */
                response$.next(
                  isSuccess
                    ? {
                        type: 'success',
                        data: dismissOptions?.data,
                        error: dismissOptions?.error,
                      }
                    : {
                        type: 'error',
                        data: dismissOptions?.data,
                        error: dismissOptions?.error,
                      }
                );
                onNotifiedToDismiss$.next();
              });
              return event$.asObservable();
            }),
            filter<ModalEvent<T>>((e) => {
              if (e.detail.type === 'will-dismiss') {
                dismissOptions?.onWillDismiss?.(e);
              } else if (e.detail.type === 'did-dismiss') {
                dismissOptions?.onDidDismiss?.(e);
              }
              return (
                e.detail.type === 'will-dismiss' ||
                e.detail.type === 'did-dismiss' ||
                e.detail.type === 'destroy'
              );
            }),
            map(() => undefined),
            takeUntil(destroy$),
            defaultIfEmpty(undefined)
          )
        );
      },
    };

    modalRoot.render(
      <ModalControllerMiddleware
        id={modalId}
        canDismiss={config?.canDismiss}
        disableBackdropDismiss={config?.disableBackdropDismiss}
        className={config?.className}
        style={config?.style}
        backdropClassName={config?.backdropClassName}
        backdropStyle={config?.backdropStyle}
        animation={{
          presentAnimationDuration: '0.3s',
          dismissAnimationDuration: '0.3s',
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
        onNotifiedToDismiss$={onNotifiedToDismiss$.asObservable().pipe(take(1))}
      >
        {config.render(modal)}
      </ModalControllerMiddleware>
    );

    return lastValueFrom(
      response$.pipe(
        takeUntil(destroy$),
        finalize(() => {
          this.modalIdToRoot.delete(modalId);
          if (this.modalIdToRoot.size === 0) {
            /** release the body scroll lock */
            allowBodyScroll();
          }
        })
      )
    ).then((res) => {
      if (res.type === 'error') {
        const exception = new Error(res?.error?.message || 'Modal error');
        Object.assign(exception, {
          type: 'error',
          data: res?.data,
          error: res?.error,
        });
        throw exception;
      }
      return res;
    });
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
