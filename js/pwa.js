/* pwa.js - instalación como aplicación y funcionamiento sin conexión.
   Solo actúa cuando la app se abre desde https:// o localhost; con doble clic (file://) el navegador no lo permite. */
(function (M) {
  "use strict";
  const { $ } = M;
  const caja = $("#pwaCaja"), estado = $("#pwaEstado"), btn = $("#pwaInstalar");
  const instalada = matchMedia("(display-mode: standalone)").matches;
  let evento = null;

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }

  function pintar() {
    if (instalada) { estado.textContent = "Reset Corporal está instalado en este equipo y abre en su propia ventana."; btn.hidden = true; return; }
    if (!/^https?:$/.test(location.protocol)) { estado.textContent = "Para instalar la app hay que abrirla desde su dirección de internet. Abierta desde un archivo no se puede instalar."; btn.hidden = true; return; }
    if (evento) { estado.textContent = "Instálelo para abrirlo con un clic desde el escritorio y usarla sin conexión."; btn.hidden = false; return; }
    estado.textContent = "Si su navegador lo permite, también puede instalarlo desde el menú de Chrome o Edge: «Instalar Reset Corporal».";
    btn.hidden = true;
  }
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); evento = e; pintar(); });
  window.addEventListener("appinstalled", () => { evento = null; estado.textContent = "Instalado. Ya puede abrirlo desde el escritorio o el menú de inicio."; btn.hidden = true; });
  btn.addEventListener("click", async () => { if (!evento) return; evento.prompt(); await evento.userChoice; evento = null; pintar(); });
  pintar();
})(window.MPS);
