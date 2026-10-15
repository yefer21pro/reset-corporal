/* comun.js - utilidades compartidas: navegación, perfil del trabajador, contador de pausas y voz. */
(function (M) {
  "use strict";
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  M.$ = $; M.$$ = $$;

  M.esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  M.pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : 0;
  M.fmt = n => String(n).replace(".", ",");
  M.duracion = r => Math.round(r.steps.reduce((a, s) => a + s[2], 0) / 6) / 10;

  /* ---------- navegación ---------- */
  M.VISTAS = ["hoy", "pausas", "puesto", "reporte", "informe", "ajustes"];
  const TITULOS = { hoy: "Hoy", pausas: "Pausas activas", puesto: "Mi puesto", reporte: "¿Le duele algo?", informe: "Mi reporte", ajustes: "Mis datos y recordatorios" };
  let primera = true;
  const alMostrar = {};
  let vistaActual = "hoy";
  M.alMostrar = (tab, fn) => { alMostrar[tab] = fn; };
  M.mostrar = function (tab) {
    vistaActual = tab;
    $$("[data-tab]").forEach(b => { if (b.dataset.tab === tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    $$("main > section.vista").forEach(s => { s.hidden = s.id !== "v-" + tab; });
    try { history.replaceState(null, "", "#" + tab); } catch (e) {}
    window.scrollTo({ top: 0 });
    document.title = TITULOS[tab] + " · Reset Corporal";
    if (alMostrar[tab]) alMostrar[tab]();
    /* el foco pasa al título de la sección para quien navega con teclado o lector de pantalla */
    if (!primera) { const h = $("#v-" + tab + " h1"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
    primera = false;
  };
  /* vuelve a pintar la vista actual (por ejemplo, al cerrar una pausa) */
  M.refrescar = () => { if (alMostrar[vistaActual]) alMostrar[vistaActual](); };
  $("#saltar").addEventListener("click", e => { e.preventDefault(); $("#contenido").focus(); });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-tab],[data-ir]");
    if (b) M.mostrar(b.dataset.tab || b.dataset.ir);
  });

  /* ---------- perfil (código, vinculación, área) ---------- */
  M.perfil = () => ({ codigo: $("#codigo").value.trim().toUpperCase(), grupo: $("#grupo").value, area: $("#area").value });
  function pintarSesion() {
    const p = M.perfil(), n = M.nombre();
    const inicial = (n || p.codigo || "?").charAt(0).toUpperCase();
    $("#sesion").innerHTML = `<span class="avatar">${M.esc(inicial)}</span><span>${
      p.codigo ? `${n ? M.esc(n) + "<br>" : ""}Código <b>${M.esc(p.codigo)}</b>` : `${n ? M.esc(n) + "<br>" : ""}Sin código registrado`}</span>`;
  }
  M.pintarSesion = pintarSesion;
  ["codigo", "grupo", "area"].forEach(id => {
    const el = $("#" + id), v = M.ls.get("mps_" + id);
    if (v) el.value = v;
    el.addEventListener("change", () => { M.ls.set("mps_" + id, el.value.trim()); pintarSesion(); });
  });

  /* pide código, vinculación y área solo cuando hay que guardar algo */
  const dlg = $("#dPerfil");
  M.conPerfil = function () {
    const p = M.perfil();
    if (p.codigo && p.grupo && p.area) return Promise.resolve(p);
    $("#dCodigo").value = p.codigo; $("#dGrupo").value = p.grupo; $("#dArea").value = p.area;
    return new Promise(resolve => {
      function cerrar(res) {
        $("#fPerfil").removeEventListener("submit", enviar);
        $("#dCancelar").removeEventListener("click", cancelar);
        dlg.removeEventListener("cancel", cancelar);
        dlg.close(); resolve(res);
      }
      function enviar(e) {
        e.preventDefault();
        const vals = { codigo: $("#dCodigo").value.trim().toUpperCase(), grupo: $("#dGrupo").value, area: $("#dArea").value };
        Object.entries(vals).forEach(([k, v]) => { $("#" + k).value = v; M.ls.set("mps_" + k, v); });
        pintarSesion(); cerrar(M.perfil());
      }
      function cancelar(e) { if (e) e.preventDefault(); cerrar(null); }
      $("#fPerfil").addEventListener("submit", enviar);
      $("#dCancelar").addEventListener("click", cancelar);
      dlg.addEventListener("cancel", cancelar);
      dlg.showModal();
      $("#dCodigo").focus();
    });
  };

  /* ---------- pausas hechas hoy (solo en este equipo) ---------- */
  const hoy = () => new Date().toLocaleDateString("en-CA");
  /* historial de pausas hechas: solo fecha y rutina, sin datos personales */
  M.pausasHoy = function () {
    const l = M.leer("pausas").filter(p => new Date(p.fecha).toLocaleDateString("en-CA") === hoy());
    return { n: l.length, rutinas: l.map(p => p.rutina) };
  };
  M.sumarPausa = function (id) {
    const l = M.leer("pausas"); l.push({ fecha: new Date().toISOString(), rutina: id });
    M.ls.set("mps_pausas", JSON.stringify(l.slice(-2000)));
  };

  /* ---------- voz guía ---------- */
  function vozEs() {
    try {
      const vs = speechSynthesis.getVoices();
      return vs.find(x => /es[-_](CO|MX|US|419)/i.test(x.lang)) || vs.find(x => /^es/i.test(x.lang)) || null;
    } catch (e) { return null; }
  }
  M.hablar = function (t) {
    const vz = $("#voz"); if (vz && vz.value !== "1") return;
    try {
      if (!("speechSynthesis" in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = "es-CO"; u.rate = .95;
      const vo = vozEs(); if (vo) u.voice = vo;
      speechSynthesis.speak(u);
    } catch (e) {}
  };
  M.callar = () => { try { speechSynthesis.cancel(); } catch (e) {} };
  M.saludo = () => { const h = new Date().getHours(); return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches"; };
  M.nombre = () => ($("#nombre") ? $("#nombre").value.trim() : "");

})(window.MPS);
