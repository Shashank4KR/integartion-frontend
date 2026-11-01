"use client";

import { createContext, useContext } from "react";

type MobileNavigationContextValue = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

export const MobileNavigationContext = createContext<MobileNavigationContextValue>({
  open: false,
  toggle: () => {},
  close: () => {},
});

export function useMobileNavigation() {
  return useContext(MobileNavigationContext);
}
