import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "@/App";
import { I18nProvider } from "@/i18n";
import { ThemeProvider } from "@/theme/theme";
import "@/styles/index.css";
import "@/styles/tokens.css";
import "@/styles/app.css";

// HashRouter (not BrowserRouter): GitHub Pages has no server-side rewrite, so deep links
// like /glossary must live behind the hash to survive a refresh without a 404 shim.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);
