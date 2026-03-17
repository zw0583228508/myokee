import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const SW_VERSION = "v4";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "activated" && navigator.serviceWorker.controller) {
              window.location.reload();
            }
          });
        }
      });
      reg.update();
    } catch (_) {}
  });
}

const storedSwVer = localStorage.getItem("myoukee-sw-ver");
if (storedSwVer && storedSwVer !== SW_VERSION) {
  if ("caches" in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
}
localStorage.setItem("myoukee-sw-ver", SW_VERSION);

createRoot(document.getElementById("root")!).render(<App />);
