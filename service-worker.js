/* service-worker.js - guarda los archivos de la app para que abra sin conexión.
   IMPORTANTE: cada vez que cambie un archivo de la app, suba el número de VERSION
   para que los equipos descarguen la versión nueva. Los datos del trabajador (localStorage)
   no se tocan nunca. */
const VERSION = "reset-corporal-v4";
const ARCHIVOS = [
  "./", "./index.html", "./manifest.json", "./css/estilos.css", "./fonts/nunito.woff2",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png",
  "./js/datos.js", "./js/comun.js", "./js/tema.js", "./js/personaje.js", "./js/humor.js", "./js/pausas.js",
  "./js/alertas.js", "./js/puesto.js", "./js/reporte.js", "./js/informe.js", "./js/hoy.js", "./js/pwa.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* primero lo guardado; si no está, la red; sin red, la pantalla principal */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).catch(() => caches.match("./index.html"))));
});

/* al tocar la notificación: abrir o enfocar la app y empezar la pausa */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const rutina = (e.notification.data && e.notification.data.rutina) || "cuello";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(lista => {
    if (lista.length) { lista[0].postMessage({ tipo: "pausa", rutina }); return lista[0].focus(); }
    return self.clients.openWindow("./index.html?pausa=" + encodeURIComponent(rutina));
  }));
});
