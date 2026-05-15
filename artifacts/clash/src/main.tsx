import { createRoot } from "react-dom/client";
import Landing from "./Landing";
import App from "./App";
import "./index.css";

document.documentElement.classList.add("dark");
document.body.style.visibility = "visible";
document.body.style.overflow = "";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const _isPWA = window.matchMedia("(display-mode: standalone)").matches;

if (_isPWA) {
  const p = window.location.pathname;
  if (p === base + "/" || p === base || p === "/") {
    window.location.replace(base + "/play");
  }
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (e) => {
    if (e.data?.type === "SW_UPDATED") {
      (window as any).__swUpdated = true;
      window.dispatchEvent(new CustomEvent("sw-updated"));
    }
  });
}

const pathname = window.location.pathname;
const isPlay =
  pathname === base + "/play" ||
  pathname === "/play" ||
  pathname.startsWith(base + "/play/") ||
  pathname.startsWith("/play/");

createRoot(document.getElementById("root")!).render(
  isPlay ? <App /> : <Landing />
);
