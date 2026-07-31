// Light/dark theme: initialised from a saved choice or the OS preference, applied as a
// `data-theme` attribute on <html> that the CSS tokens key off, and persisted on change.
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

export type Theme = "light" | "dark";
const STORAGE_KEY = "imt-theme";

function initialTheme(): Theme {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  }
  if (typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

interface ThemeValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

/** Provides light/dark theme, reflected on `<html data-theme>` and persisted to localStorage. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Deterministic default (light) so the prerendered HTML and the first client render agree
  // (hydration). An inline <head> script (index.html) has already set <html data-theme> from the
  // same saved/OS preference before first paint, so the page never flashes the default.
  const [theme, setThemeState] = useState<Theme>("light");

  // Resolve the real preference into React state after mount and re-assert it on <html> (idempotent
  // with the inline script). `data-theme` is written together with every theme change — here and in
  // setTheme/toggle below — never from a standalone [theme] effect that would run with the stale
  // initial state. So the attribute and state can never diverge, and there is no clobber to guard.
  useEffect(() => {
    const resolved = initialTheme();
    setThemeState(resolved);
    document.documentElement.dataset.theme = resolved;
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, t);
  }, []);

  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);

  const value = useMemo<ThemeValue>(() => ({ theme, toggle, setTheme }), [theme, toggle, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Access the current theme, `toggle`, and `setTheme`. Throws outside ThemeProvider. */
export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
