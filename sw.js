// Nama cache — ganti versi ini setiap kali ada update agar cache diperbarui
const CACHE_NAME = 'buku-kas-v1';

// File-file yang akan di-cache saat pertama kali install
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './img/logo.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// ===== INSTALL: cache semua file =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // Langsung aktif tanpa menunggu tab lama ditutup
  self.skipWaiting();
});

// ===== ACTIVATE: hapus cache lama =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ===== FETCH: cache-first strategy =====
// Selalu coba dari cache dulu, jika tidak ada baru ambil dari network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached; // Kembalikan dari cache (offline tetap jalan)
      }
      // Tidak ada di cache, coba ambil dari network
      return fetch(event.request).then(response => {
        // Simpan response baru ke cache untuk berikutnya
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Offline dan tidak ada di cache — kembalikan halaman utama
        return caches.match('./index.html');
      });
    })
  );
});
