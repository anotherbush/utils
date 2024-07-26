import { CSSProperties, ReactNode } from 'react';
import { OverlayStyle } from '../overlay';

type ModalEventType =
  | 'undefined'
  | 'ssr-ignored'
  | 'init'
  | 'view-init'
  | 'will-present'
  | 'did-present'
  | 'will-dismiss'
  | 'did-dismiss'
  | 'destroy'
  | 'server-side-reject'
  | 'success'
  | 'error'
  | 'abort';

export interface ModalEventDetail<T = unknown> {
  type: ModalEventType;
  target?: HTMLDivElement | null;
  data?: T;
  error?: Error;
}

export type ModalEvent<T> = CustomEvent<ModalEventDetail<T>>;

export interface ModalConfig<T = unknown> {
  animation?: ModalAnimation;
  canDismiss?: boolean;
  className?: string;
  style?: Omit<
    CSSProperties,
    | 'animationFillMode'
    | 'animationDuration'
    | 'animationTimingFunction'
    | 'animationName'
  >;
  backdropClassName?: string;
  backdropStyle?: Omit<
    OverlayStyle,
    | 'animationFillMode'
    | 'animationDuration'
    | 'animationTimingFunction'
    | 'animationName'
  >;
  disableBackdropDismiss?: boolean;
  render: (modal: Modal<T>) => ReactNode;
  onInit?(event: ModalEvent<T>): void;
  onViewInit?(event: ModalEvent<T>): void;
  onWillPresent?(event: ModalEvent<T>): void;
  onDidPresent?(event: ModalEvent<T>): void;
  onWillDismiss?(event: ModalEvent<T>): void;
  onDidDismiss?(event: ModalEvent<T>): void;
  onDestroy?(event: ModalEvent<T>): void;
}

export type ModalDismissFn<T> = (
  isSuccess: boolean,
  options?: Pick<ModalConfig<T>, 'onWillDismiss' | 'onDidDismiss'> & {
    data?: T;
    error?: Error;
  }
) => Promise<void>;

export interface Modal<T = unknown> {
  id: string;
  config?: ModalConfig<T>;
  dismiss: ModalDismissFn<T>;
}

export interface ModalAnimation {
  presentAnimationDuration: CSSProperties['animationDuration'];
  dismissAnimationDuration: CSSProperties['animationDuration'];
  presentAnimationTimingFunction: CSSProperties['animationTimingFunction'];
  dismissAnimationTimingFunction: CSSProperties['animationTimingFunction'];
}
