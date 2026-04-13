const CACHE_NAME = 'uniwa-portal-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './uniwa-1.png',
  './uniwa-logo.png',
  './uniwa-dark.png'
  // Μπορείς να προσθέσεις εδώ και άλλα αρχεία αν έχεις (π.χ. script.js αν τα έχεις σε ξεχωριστό αρχείο)
];

// Εγκατάσταση του Service Worker και αποθήκευση αρχείων
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Φόρτωση αρχείων (από την cache αν δεν υπάρχει ίντερνετ)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
          .then(response => {
            // Αν έχουμε ίντερνετ, φέρνουμε τη φρέσκια έκδοση, 
            // την αποθηκεύουμε στην cache για μετά, και τη δείχνουμε.
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
          .catch(() => {
            // Αν είμαστε εντελώς offline (χωρίς σήμα), δείχνουμε την παλιά έκδοση από την cache.
            return caches.match(event.request);
          })
      );
    });

// Ενημέρωση της Cache (όταν αλλάζεις κάτι στον κώδικα)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});