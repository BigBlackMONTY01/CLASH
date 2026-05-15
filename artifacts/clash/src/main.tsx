import { createRoot } from "react-dom/client";
import { Switch, Route, Router } from "wouter";
import Landing from "./Landing";
import App from "./App";
import "./index.css";

document.documentElement.classList.add("dark");
document.body.style.visibility = "visible";
document.body.style.overflow = "";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const _isPWA = window.matchMedia("(display-mode: standalone)").matches;

if (_isPWA && (window.location.pathname === base + "/" || window.location.pathname === base)) {
  window.location.replace(base + "/play");
}

// When a new service worker activates, signal the app to show an update banner.
// Also set a global flag so the App component can catch messages that arrived before it mounted.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", e => {
    if (e.data?.type === "SW_UPDATED") {
      (window as any).__swUpdated = true;
      window.dispatchEvent(new CustomEvent("sw-updated"));
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <Router base={base}>
    <Switch>
      <Route path="/"     component={Landing} />
      <Route path="/play" component={App} />
      <Route>{() => { window.location.replace(base + "/"); return null; }}</Route>
    </Switch>
  </Router>
);
