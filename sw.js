// SENIM service worker: беттер желіден (жаңасы бірінші), статика кэштен.
const CACHE = 'senim-v2';
const ASSETS = [
  './', './index.html', './dashboard.html', './categories.html', './merit.html',
  './safety.html', './ai-protection.html',
  './css/tw.css', './css/style.css',
  './js/app.js', './js/validators.js', './js/security.js', './js/escrow.js', './js/merit.js', './js/enterprise.js',
  './manifest.json', './assets/icons/logo.svg', './assets/icons/logo-192.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  // stale-while-revalidate: кэштен бірден береді, фонда жаңартады
  e.respondWith(caches.open(CACHE).then(async c => {
    const cached = await c.match(req);
    const net = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => cached);
    return cached || net;
  }));
});
