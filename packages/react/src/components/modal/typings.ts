import { CSSProperties, ReactNode } from 'react';
import { Observable } from 'rxjs';

type ModalEventType =
  | 'create'
  | 'init'
  | 'view-init'
  | 'will-present'
  | 'did-present'
  | 'will-dismiss'
  | 'did-dismiss'
  | 'destroy'
  | 'server-side-reject';

export interface ModalEventDetail<T = unknown> {
  type: ModalEventType;
  target: HTMLDivElement | null;
  data?: T;
}

export type ModalEvent<T> = CustomEvent<ModalEventDetail<T>>;

export interface ModalConfig<T = unknown> {
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
  config?: ModalConfig;
  present(
    children: (self: this) => ReactNode
  ): Observable<ModalEvent<T> | null>;
  dismiss(): Promise<ModalEvent<T> | null>;
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
