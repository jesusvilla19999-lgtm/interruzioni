// La rubrica si è spostata su /rubrica/: questo service worker si toglie da solo.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith('rubrica-')).map(x => caches.delete(x))))
    .then(() => self.registration.unregister()));
});
