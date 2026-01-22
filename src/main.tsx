import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// SPA 404 fallback:
// Some static hosts don't rewrite deep links (e.g. /reset-password) to /index.html.
// In those cases they serve /404.html. Our /404.html will redirect to /?p=<path>.
// Here we restore the original path before the router boots.
(() => {
  try {
    const url = new URL(window.location.href);
    const p = url.searchParams.get("p");
    if (p) {
      // Restore the original deep link path, then continue boot.
      window.history.replaceState({}, "", p);
    }
  } catch {
    // noop
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
