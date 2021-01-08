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
    caches.match(e.request).then(function (r) {
      console.log("[Service Worker] Fetching resource: " + e.request.url);
      return fetch(e.request)
        .then(function (response) {
          if (e.request.method.toUpperCase() == "GET") {
            return caches.open(CACHE_NAME).then(function (cache) {
              console.log(
                "[Service Worker] Caching new resource: " + e.request.url
              );
              cache.put(e.request, response.clone());
              return response;
            });
          } else {
            return response;
          }
        })
        .catch((e) => {
          return r;
        });
    })
  );
});
