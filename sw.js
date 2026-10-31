let OSOK=false;try{importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');OSOK=true;}catch(e){}
const C='adhyayan-v9',PL='adhyayan-pushlog';
self.addEventListener('install',e=>{if(!OSOK){e.waitUntil(Promise.reject(new Error('OneSignal worker load nahi hua')));return;}e.waitUntil(caches.open(C).then(c=>c.add('index.html').catch(()=>{})).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==PL).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
e.respondWith(fetch(e.request).then(r=>{if(r.status===200){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));}return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));});

self.addEventListener('push',function(e){e.waitUntil((async()=>{try{const c=await caches.open(PL);let a=[];const r=await c.match('log');if(r)a=await r.json();a.push(Date.now());await c.put('log',new Response(JSON.stringify(a.slice(-30)),{headers:{'Content-Type':'application/json'}}));}catch(x){}})());});

function wInfo(){return caches.open(PL).then(c=>c.put('info',new Response(JSON.stringify({os:OSOK,t:Date.now(),c:C}),{headers:{'Content-Type':'application/json'}}))).catch(()=>{});}
if(OSOK)wInfo();
self.addEventListener('activate',e=>{e.waitUntil(wInfo());});
