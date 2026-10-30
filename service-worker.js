const CACHE = "co-ban-strength-v5";
const ASSETS = ["./", "./index.html", "./styles.css", "./styles.css?v=4", "./winner.css?v=4", "./winner.css", "./logic.js", "./app.js", "./manifest.webmanifest", "./assets/icon.svg", "./assets/hero-training.jpg"];
self.addEventListener("install", (event) => { event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener("activate", (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))); self.clients.claim(); });
self.addEventListener("fetch", (event) => { if (event.request.method !== "GET") return; event.respondWith(fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))); });
