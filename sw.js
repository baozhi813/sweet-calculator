// 甜心算盘 Service Worker
var CACHE = 'sweet-calc-v2';
var ASSETS = [
  './',
  './calculator_cute.html',
  './manifest.json'
];

// 安装：缓存核心资源
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(ASSETS).catch(function() {
        // 某些文件可能不存在，继续即可
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) {
        return k !== CACHE;
      }).map(function(k) {
        return caches.delete(k);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// 请求：缓存优先，网络回退
self.addEventListener('fetch', function(e) {
  // 只处理 GET
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetched = fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(c) {
            c.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return cached || new Response('离线模式', { status: 503 });
      });

      return cached || fetched;
    })
  );
});
