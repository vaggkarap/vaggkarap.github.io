const CACHE_NAME = 'uniwa-portal-v2'; // Άλλαξα το v1 σε v2 για να καταλάβει το κινητό σου ότι υπάρχει νέα έκδοση
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './uniwa-1.png',
  './uniwa-logo.png',
  './uniwa-dark.png'
];

// 1. Εγκατάσταση του Service Worker και αποθήκευση αρχείων
self.addEventListener('install', event => {
  // Η εντολή αυτή αναγκάζει την εφαρμογή να μην περιμένει να κλείσει για να πάρει το update
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Φόρτωση αρχείων (Network-First στρατηγική)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Αν έχουμε ίντερνετ, φέρνουμε τη φρέσκια έκδοση, 
        // την αποθηκεύουμε στην cache για το μέλλον, και τη δείχνουμε στον χρήστη.
        return caches.open(CACHE_NAME).then(cache => {
          // Αποθηκεύουμε μόνο requests που υποστηρίζονται σωστά (π.χ. όχι requests από Chrome extensions)
          if (event.request.url.startsWith('http')) {
              cache.put(event.request, response.clone());
          }
          return response;
        });
      })
      .catch(() => {
        // Αν είμαστε εντελώς offline (χωρίς ίντερνετ), δείχνουμε την τελευταία αποθηκευμένη έκδοση από την cache.
        return caches.match(event.request);
      })
  );
});

// 3. Ενημέρωση της Cache (Διαγραφή παλιών εκδόσεων)
self.addEventListener('activate', event => {
  // Η εντολή αυτή λέει στον Service Worker να πάρει τον έλεγχο της σελίδας αμέσως
  event.waitUntil(clients.claim()); 

  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});