/* GroupChatOn app service worker: opens instantly and keeps chapters for reading without internet.
   - the app itself (shell, styles, script, icons): saved on install, served from the device, refreshed by new versions
   - every screen (/, /novel/…, /read/…): the saved app shell, so links work offline too
   - data/novels.json: fresh when online (3 s), the saved copy when offline
   - chapters (/c/…json): the saved copy first, refreshed in the background; every opened chapter is kept
   - fonts and cover pictures: saved the first time they are used
   - sponsor cards (data/promos.json + every sponsor picture): saved at install and whenever the list is fetched,
     so a sponsor card can fill an empty ad space offline too
   It replaces the old "Infinity App" service worker of this address: its caches are removed when this one starts.
   (Records saved by the old Infinity App are in IndexedDB/localStorage, never in these caches, so they are not touched.)
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
var VERSION = '2026-11-08.622ccc0';
var SHELL = 'gcr-shell-' + VERSION, CHAPTERS = 'gcr-chapters', DATA = 'gcr-data', EXT = 'gcr-ext', IMG = 'gcr-img', SPON = 'gcr-sponsor';

// the sponsor list and all its pictures; pictures of sponsors that were removed are dropped
function saveSponsors(res) {
  return caches.open(SPON).then(function (c) {
    return (res ? Promise.resolve(res) : fetch('/data/promos.json', { cache: 'no-cache' })).then(function (r) {
      if (!r || !r.ok) return;
      return c.put('/data/promos.json', r.clone()).then(function () { return r.json(); }).then(function (P) {
        var imgs = [];
        ((P && P.promos) || []).forEach(function (x) { (x.imgs || []).forEach(function (u) { imgs.push(u); }); });
        return c.keys().then(function (ks) {
          ks.forEach(function (k) { if (/^https?:/.test(k.url) && !/\/data\/promos\.json$/.test(k.url) && imgs.indexOf(k.url) < 0) c.delete(k); });
          return Promise.all(imgs.map(function (u) {
            return c.match(u).then(function (hit) { return hit || fetch(new Request(u, { mode: 'no-cors' })).then(function (ir) { return c.put(u, ir); }); }).catch(function () {});
          }));
        });
      });
    }).catch(function () {});
  });
}
var FILES = [
 "/",
 "/reader.js?v=2026-11-08.622ccc0",
 "/reader.css?v=2026-11-08.622ccc0",
 "/app.webmanifest",
 "/brand/logo-light.png",
 "/brand/logo-dark.png",
 "/brand/favicon-32.png",
 "/brand/favicon-192.png",
 "/brand/apple-touch-icon.png"
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); })); })
    .then(function () { saveSponsors(); return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  var keep = [SHELL, CHAPTERS, DATA, EXT, IMG, SPON];
  var fromOldApp = false;
  e.waitUntil(caches.keys().then(function (keys) {
    fromOldApp = keys.some(function (k) { return /^gco-app-/.test(k); });
    return Promise.all(keys.filter(function (k) { return keep.indexOf(k) < 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }).then(function () {
    // replacing the old Infinity App: pages it already showed are reloaded once so they become the reading app
    if (fromOldApp) return self.clients.matchAll({ type: 'window' }).then(function (cs) { cs.forEach(function (c) { if (c.navigate) c.navigate(c.url).catch(function () {}); }); });
  }));
});

function put(name, req, res) { var copy = res.clone(); caches.open(name).then(function (c) { c.put(req, copy); }); return res; }
function timeout(p, ms) { return new Promise(function (ok, fail) { var t = setTimeout(function () { fail(new Error('slow')); }, ms); p.then(function (r) { clearTimeout(t); ok(r); }, function (x) { clearTimeout(t); fail(x); }); }); }

self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.origin === location.origin) {
    var p = url.pathname;
    // the old tool addresses are small redirect pages to Infinity: always from the network
    if (/^\/t\//.test(p)) {
      if (req.mode === 'navigate') e.respondWith(fetch(req).catch(function () { return caches.match('/', { cacheName: SHELL }); }));
      return;
    }
    if (req.mode === 'navigate' && !/\.(?!html$)\w+$/.test(p)) {   // every app screen is the same page: the saved shell, refreshed in the background
      e.respondWith(caches.open(SHELL).then(function (c) {
        return c.match('/').then(function (hit) {
          var live = fetch('/', { cache: 'no-cache' }).then(function (r) { if (r.ok) c.put('/', r.clone()); return r; });
          if (hit) { e.waitUntil(live.catch(function () {})); return hit; }
          return live.then(function (r) { return r.ok ? r : fetch(req); }).catch(function () { return fetch(req); });
        });
      }));
      return;
    }
    if (p === '/data/novels.json') {
      e.respondWith(timeout(fetch(req, { cache: 'no-cache' }), 3000).then(function (r) { return r.ok ? put(DATA, '/data/novels.json', r) : r; })
        .catch(function () { return caches.match('/data/novels.json').then(function (hit) { return hit || fetch(req); }); }));
      return;
    }
    if (p === '/data/promos.json') {   // sponsor list: fresh when online (its pictures saved), saved copy offline
      e.respondWith(timeout(fetch(req, { cache: 'no-cache' }), 3000).then(function (r) { if (r.ok) saveSponsors(r.clone()); return r; })
        .catch(function () { return caches.open(SPON).then(function (c) { return c.match('/data/promos.json'); }).then(function (hit) { return hit || fetch(req); }); }));
      return;
    }
    if (/^\/c\/.+\.json$/.test(p)) {
      e.respondWith(caches.open(CHAPTERS).then(function (c) {
        return c.match(p).then(function (hit) {
          var live = fetch(p).then(function (r) { if (r.ok) c.put(p, r.clone()); return r; });
          if (hit) { e.waitUntil(live.catch(function () {})); return hit; }
          return live;
        });
      }));
      return;
    }
    e.respondWith(caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (r) { if (r.ok && /^\/brand\//.test(p)) put(SHELL, req, r); return r; });
    }));
    return;
  }
  // fonts: saved copy, refreshed in the background
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(EXT).then(function (c) {
      return c.match(req).then(function (hit) {
        var live = fetch(req).then(function (r) { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; });
        if (hit) { e.waitUntil(live.catch(function () {})); return hit; }
        return live;
      });
    }));
    return;
  }
  // cover pictures and pictures inside chapters: saved the first time (at most 300 kept)
  if (/^blogger\.googleusercontent\.com$|\.bp\.blogspot\.com$/.test(url.hostname) && req.destination === 'image') {
    e.respondWith(caches.open(SPON).then(function (sc) { return sc.match(req.url); }).then(function (spon) { return spon || caches.open(IMG).then(function (c) {
      return c.match(req).then(function (hit) {
        return hit || fetch(req).then(function (r) {
          if (r.ok || r.type === 'opaque') { c.put(req, r.clone()); c.keys().then(function (ks) { if (ks.length > 300) c.delete(ks[0]); }); }
          return r;
        });
      });
    }); }));
  }
});
