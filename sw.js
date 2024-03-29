const staticCache = 'site-static-v52';
const assets = [
    '/',
    'index.html',
    'js/app.js',
    'js/db.js',
    'js/firebaseAuth.js',
    'css/main.css',
    'css/normalize.css',
    'img/Spinner.svg'
];
//install service worker
self.addEventListener('install', evt => {
    //console.log('service worker installed');
    evt.waitUntil(
      caches.open(staticCache).then((cache) => {
        console.log('caching shell assets');
        return cache.addAll(assets);
      })
    );
});

self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCache)
                .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', evt => {
    if(evt.request.url.indexOf('firestore.googleapis.com') === -1) {
        evt.respondWith(
            caches.match(evt.request).then(cacheRes => {
                return cacheRes || fetch(evt.request)
            })
        );
    }
});