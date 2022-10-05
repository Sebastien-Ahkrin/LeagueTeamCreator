import { createContext } from 'react';

const defaultPortalContext =
  typeof document === 'undefined' ? null : document.body;
export const portalContext = createContext<HTMLElement | null>(
  defaultPortalContext,
);
