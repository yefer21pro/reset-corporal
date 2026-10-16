/* alertas.js - recordatorio de pausa: en pantalla y, si el trabajador lo activa, como notificación del sistema
   (Notification API). Funciona mientras la app esté abierta en el navegador. Cada aviso propone una rutina distinta. */
(function (M) {
  "use strict";
  const { $ } = M;
  const sel = $("#recCada");
  let t = null, siguiente = 1;

  /* ---------- avisos del sistema ---------- */
  const hayApi = "Notification" in window;
  const quiere = () => M.ls.get("mps_notif") === "1";
  const activos = () => hayApi && quiere() && Notification.permission === "granted";

  function texto(r) {
    const n = M.nombre() ? M.nombre() + ", " : "";
    const cuerpo = M.humor() > 0 ? "Su silla pide un descanso de usted. Son pocos minutos." : "Haga una pausa guiada de pocos minutos.";
    return { titulo: `${n}es hora de su pausa de ${r.name}`.replace(/^./, c => c.toUpperCase()), cuerpo };
  }
  /* En el celular (Android) el navegador no deja crear la notificación desde la página:
     hay que pedírsela al service worker. En el PC se usa ese mismo camino y, si no hay, el directo. */
  async function notificar(r) {
    if (!activos()) return false;
    const { titulo, cuerpo } = texto(r);
    const opciones = { body: cuerpo, tag: "reset-corporal", icon: "icons/icon-192.png", badge: "icons/icon-192.png", requireInteraction: true, data: { rutina: r.id } };
    try {
      if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(titulo, opciones);
        return true;
      }
      const n = new Notification(titulo, opciones);
      n.onclick = () => { window.focus(); n.close(); abrirPausa(r.id); };
      return true;
    } catch (e) { return false; /* queda el aviso en pantalla */ }
  }
  function abrirPausa(id) { $("#recordatorio").hidden = true; M.iniciarPausa(id); programar(+sel.value); }
  /* la notificación toca la app abierta (mensaje) o la abre con ?pausa=... */
  if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", e => { if (e.data && e.data.tipo === "pausa") abrirPausa(e.data.rutina); });
  window.addEventListener("load", () => {
    const id = new URLSearchParams(location.search).get("pausa");
    if (id && M.ROUT.some(x => x.id === id)) { history.replaceState(null, "", location.pathname); abrirPausa(id); }
  });

  const estado = $("#notifEstado"), btnAct = $("#notifActivar"), btnProbar = $("#notifProbar");
  function pintarEstado() {
    btnProbar.hidden = true;
    if (!hayApi) { estado.textContent = "Este navegador no permite avisos del sistema. Se seguirá usando el aviso en pantalla."; btnAct.hidden = true; return; }
    const p = Notification.permission;
    if (p === "denied") { estado.textContent = "Los avisos están bloqueados en el navegador. Para activarlos, haga clic en el candado junto a la dirección, permita las notificaciones y recargue la página."; btnAct.hidden = false; btnAct.textContent = "Activar avisos del sistema"; return; }
    if (activos()) {
      estado.textContent = +sel.value ? `Activados. Le avisaremos cada ${sel.value} minutos mientras Reset Corporal esté abierto.` : "Activados, pero falta elegir cada cuánto avisarle en «Recordatorio en pantalla».";
      btnAct.textContent = "Desactivar avisos del sistema"; btnProbar.hidden = false;
    } else { estado.textContent = ""; btnAct.textContent = "Activar avisos del sistema"; }
    btnAct.hidden = false;
  }
  btnAct.addEventListener("click", async () => {
    if (activos()) { M.ls.set("mps_notif", "0"); pintarEstado(); return; }
    const p = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (p === "granted") { M.ls.set("mps_notif", "1"); pintarEstado(); }
    else { pintarEstado(); if (p !== "denied") estado.textContent = "No se activaron los avisos: el navegador no recibió su permiso."; }
  });
  btnProbar.addEventListener("click", async () => {
    const ok = await notificar(M.ROUT[0]);
    estado.textContent = ok ? "Aviso de prueba enviado. Si no lo ve, revise que las notificaciones de este sitio o de la app estén permitidas en la configuración del teléfono o de Windows."
                            : "El navegador no dejó mostrar el aviso. Revise los permisos de notificaciones del sitio.";
  });

  /* ---------- recordatorio ---------- */
  function programar(minutos) {
    clearTimeout(t);
    if (!minutos) return;
    t = setTimeout(() => {
      const r = M.ROUT[(siguiente++) % M.ROUT.length];
      $("#recMin").textContent = +sel.value;
      $("#recQue").textContent = r.name;
      $("#recIr").dataset.r = r.id;
      $("#recordatorio").hidden = false;
      M.hablar(`${M.nombre() ? M.nombre() + ", " : ""}es hora de tu pausa de ${r.name}.`);
      notificar(r);
    }, minutos * 60000);
  }

  sel.value = M.ls.get("mps_recordatorio") || "0";
  sel.addEventListener("change", () => { M.ls.set("mps_recordatorio", sel.value); programar(+sel.value); pintarEstado(); });
  programar(+sel.value);
  pintarEstado();

  $("#recIr").addEventListener("click", () => {
    $("#recordatorio").hidden = true;
    M.iniciarPausa($("#recIr").dataset.r || "cuello");
    programar(+sel.value);
  });
  $("#recLuego").addEventListener("click", () => {
    $("#recordatorio").hidden = true;
    clearTimeout(t);
    t = setTimeout(() => { $("#recordatorio").hidden = false; }, 10 * 60000);
  });
})(window.MPS);
