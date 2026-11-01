const CACHE = "co-ban-strength-v13";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./styles.css?v=5",
  "./winner.css",
  "./winner.css?v=5",
  "./ux.css",
  "./ux.css?v=1",
  "./modern.css",
  "./modern.css?v=2",
  "./modern.css?v=3",
  "./modern.css?v=4",
  "./modern.css?v=5",
  "./modern.css?v=6",
  "./modern.css?v=7",
  "./logic.js",
  "./app.js",
  "./ui-effects.js",
  "./rewards.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/hero-training.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("./index.html"))
      )
  );
});
