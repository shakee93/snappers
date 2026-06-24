"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ChromeVisibilityContextValue = {
  hideChrome: boolean;
  setHideChrome: (hidden: boolean) => void;
};

const ChromeVisibilityContext =
  createContext<ChromeVisibilityContextValue | null>(null);

export function ChromeVisibilityProvider({ children }: { children: ReactNode }) {
  const [hideChrome, setHideChromeState] = useState(false);

  const setHideChrome = useCallback((hidden: boolean) => {
    setHideChromeState(hidden);
  }, []);

  const value = useMemo(
    () => ({ hideChrome, setHideChrome }),
    [hideChrome, setHideChrome],
  );

  return (
    <ChromeVisibilityContext.Provider value={value}>
      {children}
    </ChromeVisibilityContext.Provider>
  );
}

export function useChromeVisibility() {
  const context = useContext(ChromeVisibilityContext);
  if (!context) {
    throw new Error("useChromeVisibility must be used within ChromeVisibilityProvider");
  }
  return context;
}

export function ChromeGate({ children }: { children: ReactNode }) {
  const { hideChrome } = useChromeVisibility();
  if (hideChrome) return null;
  return <>{children}</>;
}
