import { ElementGetter, getElement } from '@anotherbush/react';
import { FC, ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHydrated } from '../../hooks/use-hydrated';

export interface PortalProps {
  container?: ElementGetter;
  disablePortal?: boolean;
  children: ReactNode;
}

export const Portal: FC<PortalProps> = ({
  children,
  container,
  disablePortal,
}) => {
  const hydrated = useHydrated();
  const [portalElement, setPortalElement] = useState(() =>
    disablePortal ? null : getElement(container)
  );

  useEffect(() => {
    if (hydrated && !disablePortal) {
      const nextPortalElement = getElement(container) || document.body;
      setPortalElement(nextPortalElement);
    }
  }, [container, disablePortal, hydrated]);

  if (!hydrated) return null;

  if (disablePortal || !portalElement) {
    return <>{children}</>;
  }

  return createPortal(children, portalElement);
};
