// Service worker: tiene l'app e i dati sul telefono per usarla anche senza rete.
const VERSIONE = 'interruzioni-v1';
const FILE_APP = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './icon-maskable-512.png', './apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSIONE).then(c => Promise.all(FILE_APP.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSIONE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const mine = url.origin === self.location.origin || url.hostname === 'cdnjs.cloudflare.com' || url.hostname.endsWith('gstatic.com') || url.hostname === 'fonts.googleapis.com';
  if (!mine) return;
  // Prima la rete (così il programma nuovo arriva subito), senza rete la copia salvata
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(VERSIONE).then(x => x.put(e.request, c)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
