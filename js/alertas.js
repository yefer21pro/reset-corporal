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
  function notificar(r) {
    if (!activos()) return;
    try {
      const n = new Notification(texto(r).titulo, { body: texto(r).cuerpo, tag: "reset-corporal", requireInteraction: true });
      n.onclick = () => { window.focus(); n.close(); $("#recordatorio").hidden = true; M.iniciarPausa(r.id); programar(+sel.value); };
    } catch (e) { /* si el navegador no deja, queda el aviso en pantalla */ }
  }

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
  btnProbar.addEventListener("click", () => notificar(M.ROUT[0]));

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
