import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "@/App";
import { I18nProvider } from "@/i18n";
import "@/styles/index.css";

// HashRouter (not BrowserRouter): GitHub Pages has no server-side rewrite, so deep links
// like /glossary must live behind the hash to survive a refresh without a 404 shim.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </I18nProvider>
  </StrictMode>,
);
