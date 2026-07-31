import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "@/routes";
import "@/styles/fonts.css";
import "@/styles/index.css";
import "@/styles/tokens.css";
import "@/styles/app.css";

// Static-site generation with client hydration. `vite-react-ssg build` prerenders each route to
// HTML for crawlability; the same entry hydrates the client. HashRouter is gone — routes are real
// paths (see docs/seo.md).
export const createRoot = ViteReactSSG({ routes });
