/* VK Studio — Service Worker v1 */
const CACHE = 'vk-studio-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-180.png',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap',
  'https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  /* PDF files: red de primero (siempre frescos), caché como fallback */
  if (e.request.url.includes('.pdf')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  /* Todo lo demás: caché primero */
  e.respondWith(
    caches.match(e.request).then(cached => cached ||
      fetch(e.request).then(resp => {
        if (resp && resp.status === 200 && resp.type !== 'opaque') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached)
    )
  );
});
