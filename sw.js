const CACHE_NAME = 'minibus-taxi-finder-v5';
const urlsToCache = [
    'index.html',
    'map.html',
    'offline map.jpg',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.6.0/remixicon.min.css',
    'https://static.readdy.ai/image/4af54f873fec3d1a2ef13aa3c18bbec0/8b2ad1ca07e49cd9e3d3913c13cb821f.png',
    'https://public.readdy.ai/ai/img_res/3d38e468c1e004bfd7e4a15587b2ee19.jpg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching files:', urlsToCache);
            return cache.addAll(urlsToCache);
        }).catch(err => console.error('Cache error:', err))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log('Serving from cache:', event.request.url);
                return response;
            }

            if (event.request.url.includes('tiles.stadiamaps.com')) {
                return fetch(event.request).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        console.log('Stadia Maps failed, falling back to offline map');
                        return caches.match('offline map.jpg');
                    }
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                    return networkResponse;
                }).catch(() => {
                    console.log('Network failed, falling back to offline map');
                    return caches.match('offline map.jpg');
                });
            }

            return fetch(event.request).catch(() => {
                console.log('Fetch failed, falling back to index.html');
                return caches.match('index.html');
            });
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        })
    );
});
