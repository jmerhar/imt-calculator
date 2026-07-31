// Light/dark theme: initialised from a saved choice or the OS preference, applied as a
// `data-theme` attribute on <html> that the CSS tokens key off, and persisted on change.
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  // (hydration). The persisted/OS preference is resolved after mount.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(initialTheme());
  }, []);

  // An inline <head> script (index.html) already set <html data-theme> from the same preference
  // before first paint, so skip the first application here — otherwise the deterministic initial
  // ("light") state would clobber it for a frame before the mount effect above resolves the real
  // preference, reintroducing a flash. Preference-resolution and user toggles write through.
  const applied = useRef(false);
  useEffect(() => {
    if (!applied.current) {
      applied.current = true;
      return;
    }
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, t);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeValue>(() => ({ theme, toggle, setTheme }), [theme, toggle, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Access the current theme, `toggle`, and `setTheme`. Throws outside ThemeProvider. */
export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
