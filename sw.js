/* BOLIDE — Service Worker：页面级缓存（媒体资源量大，仅缓存骨架） */
const CACHE = 'bolide-v4';
const SHELL = [
  './',
  './index.html',
  './en.html',
  './css/style.css',
  './js/main.js',
  './manifest.json',
  './assets/hero.webp',
  './assets/web/hero.mp4',
  './assets/web/moodcut.mp4',
  './assets/web/cota.mp4',
  './assets/web/miami.mp4',
  './assets/web/brakes.mp4'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // 媒体文件：网络优先，失败回退缓存
  if (/\.(webp|mp4|pdf|woff2?)$/.test(url.pathname)) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }
  // 骨架：缓存优先，网络更新
  e.respondWith(
    caches.match(req).then((hit) => {
      const fetchP = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => hit);
      return hit || fetchP;
    })
  );
});
