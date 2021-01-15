//service-worker.js
const CACHE_NAME = "swim-mail-cache";

const FILES_TO_CACHE = [
  "/icons/ico32.png",
  "/icons/ico512.png",
  "/icons/fav16.png",
  "/icons/fav32.png",
  "/app.webmanifest",
  "/css/style-min.css",
  "/js/main-min.js",
  "/index.html",
  "/",
];

self.addEventListener("install", (event) => {
  console.log("tetst");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("fetch", function (e) {
  e.respondWith(
    fetch(e.request).catch(function () {
      return cache.match(e.request);
    })
  );
});
