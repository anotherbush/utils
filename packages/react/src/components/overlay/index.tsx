import { CSSProperties, FC } from 'react';
import { Portal, PortalProps } from '../portal';

export interface OverlayProps extends PortalProps {
  className?: string;
  style?: CSSProperties;
}

export const Overlay: FC<OverlayProps> = ({
  children,
  disablePortal,
  container,
  className,
  style,
}) => {
  return (
    <Portal disablePortal={disablePortal} container={container}>
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 100000,
          ...style,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        className={className}
      >
        {children}
      </div>
    </Portal>
  );
};
