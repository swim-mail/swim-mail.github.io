//service-worker.js
const CACHE_NAME = 'swim-mail-cache'; 

const FILES_TO_CACHE = [
    '/icons/ico32.png',
    '/icons/ico512.png',
    '/icons/fav16.png',
    '/icons/fav32.png',
    '/app.webmanifest',
    '/css/style-min.css',
    '/js/main-min.js',
    '/index.html',
];

self.addEventListener('install', (event) => {

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );

});

self.addEventListener('fetch', (event) => {
    
    if (event.request.method !== 'GET') { // GET 요청만 캐싱 지원 처리
        return;
    }

    const fetchRequest = event.request.clone();

    event.respondWith(
        fetch(fetchRequest)
            .then((response) => {
                caches.open(CACHE_NAME) // 네트워크 요청 성공시 해당 결과값 캐싱
                      .then(cache => cache.put(event.request.url, response.clone()));
                return response;
            })
            .catch(() => {
                return caches.match(event.request.url)
                    .then(cache => {return cache;}) // 네트워크 요청 실패시 캐싱된 요청으로 응답.
            })
    )
    ;
});