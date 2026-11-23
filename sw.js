// KMM Newsletter service worker: pages load fresh when online and from the phone's cache when offline.
var V='kmm-v1';
var SHELL=['./','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(SHELL)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
function off(){return new Response('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><body style="background:#0A0C0E;color:#ECE8E1;font:16px -apple-system,sans-serif;padding:40px 22px;line-height:1.5"><p>Нет подключения к интернету. Этот выпуск еще не сохранен на телефоне.</p><p style="color:#8A8F95">No internet connection. This edition has not been saved on this phone yet.</p><p><a style="color:#F0A564" href="../#archive">← Все выпуски / All editions</a></p>',{headers:{'Content-Type':'text/html; charset=utf-8'}})}
function put(req,res){if(res&&(res.ok||res.type==='opaque')){var c=res.clone();caches.open(V).then(function(x){x.put(req,c)})}return res}
self.addEventListener('fetch',function(e){var r=e.request;if(r.method!=='GET')return;var u=new URL(r.url);
  if(u.origin===location.origin&&(r.mode==='navigate'||/\.html$|\/$/.test(u.pathname))){
    // pages (the edition list and the editions): network first, cached copy when offline
    e.respondWith(fetch(r).then(function(res){return put(r,res)}).catch(function(){return caches.match(r,{ignoreSearch:true}).then(function(m){return m||(/\/editions\//.test(u.pathname)?off():caches.match('./'))})}));return}
  // icons and fonts: cache first, refreshed in the background
  e.respondWith(caches.match(r).then(function(m){var f=fetch(r).then(function(res){return put(r,res)}).catch(function(){return m});return m||f}));
});
