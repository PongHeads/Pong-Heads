// Cache name bumped every release so stale builds cannot survive an update. (build C4)
const CACHE = 'bph-J1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
  self.clients.claim();
});
// Always go to the network for the page itself. Never serve a stale game.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isHTML = e.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname.endsWith('/');
  if (isHTML) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(c => c || fetch(e.request).then(res => {
      if (res.ok && url.origin === location.origin) caches.open(CACHE).then(x => x.put(e.request, res.clone()));
      return res;
    }).catch(() => c))
  );
});
