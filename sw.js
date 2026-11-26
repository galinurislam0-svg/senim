// SENIM service worker: беттер желіден (жаңасы бірінші), статика кэштен.
const CACHE = 'senim-v5';
const ASSETS = [
  './', './index.html', './dashboard.html', './categories.html', './merit.html',
  './safety.html', './ai-protection.html', './404.html', './js/inner.js', './js/dashboard.js', './js/vendor/gsap.min.js', './js/vendor/ScrollTrigger.min.js',
  './css/site.css', './css/fonts.css', './css/tw.css', './css/style.css',
  './assets/fonts/geologica-cyrillic.woff2', './assets/fonts/geologica-cyrillic-ext.woff2', './assets/fonts/geologica-latin.woff2',
  './assets/fonts/onest-cyrillic.woff2', './assets/fonts/onest-cyrillic-ext.woff2', './assets/fonts/onest-latin.woff2',
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
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
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
