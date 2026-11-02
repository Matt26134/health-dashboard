const CACHE_NAME='health-dashboard-v1.1.0-day2';
const APP_SHELL=['./','./index.html','./styles.css','./db-v1.js','./curriculum-v1.js','./integrations-v1.js','./app-v1.js','./v1features-v1.js','./launch-v1.js','./day2-v1.js','./manifest.webmanifest','./version.json','./app-icon-192.png','./app-icon-512.png','./BACKLOG.md'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
    if(response && response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put(event.request,copy));}
    return response;
  }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
});
