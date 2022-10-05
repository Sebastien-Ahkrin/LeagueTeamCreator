import { ReactNode, useContext } from 'react';
import { createPortal } from 'react-dom';

import { portalContext } from './PortalContext';

export interface PortalProps {
  children: ReactNode;
}

export function Portal(props: PortalProps) {
  const element = useContext(portalContext);
  if (element === null) {
    return null;
  }
  return createPortal(props.children, element);
}
