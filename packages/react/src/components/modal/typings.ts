import { CSSProperties, ReactNode } from 'react';

type ModalEventType =
  | 'create'
  | 'init'
  | 'view-init'
  | 'will-present'
  | 'did-present'
  | 'will-dismiss'
  | 'did-dismiss'
  | 'destroy'
  | 'server-side-reject'
  | 'success'
  | 'error';

export interface ModalEventDetail<T = unknown> {
  type: ModalEventType;
  target?: HTMLDivElement | null;
  data?: T;
  error?: Error;
}

export type ModalEvent<T> = CustomEvent<ModalEventDetail<T>>;

export interface ModalConfig<T = unknown> {
  disableBackdropDismiss?: boolean;
  canDismiss?: boolean;
  onInit?(event: ModalEvent<T>): void;
  onViewInit?(event: ModalEvent<T>): void;
  onWillPresent?(event: ModalEvent<T>): void;
  onDidPresent?(event: ModalEvent<T>): void;
  onWillDismiss?(event: ModalEvent<T>): void;
  onDidDismiss?(event: ModalEvent<T>): void;
  onDestroy?(event: ModalEvent<T>): void;
  animation?: Partial<
    Omit<
      ModalAnimation,
      | 'overlayPresentAnimationName'
      | 'overlayDismissAnimationName'
      | 'modalPresentAnimationName'
      | 'modalDismissAnimationName'
    >
  >;
}

export interface Modal<T = unknown> {
  id: string;
  config?: ModalConfig<T>;
  present(children: (self: this) => ReactNode): Promise<ModalEventDetail<T>>;
  dismiss(
    options?: Pick<ModalConfig<T>, 'onWillDismiss' | 'onDidDismiss'> & {
      data?: T;
      error?: Error;
    }
  ): Promise<void>;
}

export interface ModalAnimation {
  overlayPresentAnimationName: string;
  overlayDismissAnimationName: string;
  modalPresentAnimationName: string;
  modalDismissAnimationName: string;
  animationDuration: CSSProperties['animationDuration'];
  presentAnimationTimingFunction: CSSProperties['animationTimingFunction'];
  dismissAnimationTimingFunction: CSSProperties['animationTimingFunction'];
}
