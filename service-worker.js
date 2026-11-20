const C='ilha-v24',THREE='https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
const F=['./','index.html','style.css','manifest.json','assets/island.jpg','assets/icons/icon-192.png','assets/icons/icon-512.png',
 'src/main.js','src/world.js','src/player.js','src/controls.js','src/blocky.js','src/inventory.js','src/crafting.js','src/building.js','src/missions.js','src/monsters.js','src/tools.js','src/audio.js',THREE];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(u).catch(()=>0)))))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==C).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
  e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r}).catch(()=>null);
    if(hit){net.catch(()=>0);return hit}
    return (await net)||(e.request.mode==='navigate'?c.match('index.html'):Response.error())}))});
