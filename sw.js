let OSOK=false;try{importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');OSOK=true;}catch(e){}
const C='adhyayan-v38',PL='adhyayan-pushlog';
const PRE=['index.html','./','manifest.json','icon-192.png','icon-512.png','notes.json','notice.json'];
self.addEventListener('install',e=>{
 /* OneSignal worker load na ho: agar pehle se chalta hua worker hai to naya install mat karo (purana bacha rahe). Pehli baar install ho raha ho to chalne do, taaki offline kaam kare. */
 if(!OSOK){try{importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');OSOK=true;}catch(x){}}
 if(!OSOK&&self.registration.active){e.waitUntil(Promise.reject(new Error('OneSignal worker load nahi hua')));return;}
 e.waitUntil(caches.open(C).then(c=>Promise.all(PRE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==PL).map(x=>caches.delete(x)))).then(()=>self.clients.claim()).then(wInfo));});
/* network pehle, par 2.5 second mein jawab na aaye (kamzor/atka hua net) to saved copy turant; peeche net se naya copy aata rehta hai */
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET'||new URL(q.url).origin!==location.origin)return;
 e.respondWith((async()=>{
  const cache=await caches.open(C),nav=q.mode==='navigate';
  const fromCache=async()=>(await cache.match(q,{ignoreSearch:nav}))||(nav?((await cache.match('index.html'))||(await cache.match('./'))):undefined);
  const net=fetch(q).then(r=>{if(r&&r.status===200){cache.put(q,r.clone());}return r;});
  e.waitUntil(net.catch(()=>{}));
  let timer;const timeout=new Promise(res=>{timer=setTimeout(async()=>res(await fromCache()),2500);});
  try{const r=await Promise.race([net.then(x=>{clearTimeout(timer);return x;}),timeout]);if(r)return r;return await net;}
  catch(err){clearTimeout(timer);const c=await fromCache();return c||new Response('Offline',{status:503,headers:{'Content-Type':'text/plain'}});}
 })());});
self.addEventListener('push',function(e){e.waitUntil((async()=>{try{const c=await caches.open(PL);let a=[];const r=await c.match('log');if(r)a=await r.json();a.push(Date.now());await c.put('log',new Response(JSON.stringify(a.slice(-30)),{headers:{'Content-Type':'application/json'}}));}catch(x){}})());});
function wInfo(){return caches.open(PL).then(c=>c.put('info',new Response(JSON.stringify({os:OSOK,t:Date.now(),c:C}),{headers:{'Content-Type':'application/json'}}))).catch(()=>{});}
if(OSOK)wInfo();
