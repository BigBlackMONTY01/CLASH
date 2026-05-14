import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import Landing from "./Landing";
import App from "./App";
import "./index.css";

document.documentElement.classList.add("dark");

if (window.matchMedia("(display-mode: standalone)").matches && window.location.pathname === "/") {
  window.location.replace("/play");
}


// When a new service worker activates and takes over, reload once to serve fresh assets.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", e => {
    if (e.data?.type === "SW_UPDATED") window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(
  <Switch>
    <Route path="/"     component={Landing} />
    <Route path="/play" component={App} />
    <Route>{() => { window.location.replace("/"); return null; }}</Route>
  </Switch>
);
