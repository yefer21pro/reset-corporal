/* pausas.js - módulo 2: rutinas guiadas con figura y voz, y agenda de pausas (.ics). */
(function (M) {
  "use strict";
  const { $, $$ } = M;

  /* nombre para la voz: se queda solo en este equipo */
  const nm = $("#nombre"); const v = M.ls.get("mps_nombre"); if (v) nm.value = v;
  nm.addEventListener("change", () => { M.ls.set("mps_nombre", nm.value.trim()); M.pintarSesion(); });
  const vz = $("#voz"); vz.value = M.ls.get("mps_voz") || "1";
  vz.addEventListener("change", () => { M.ls.set("mps_voz", vz.value); if (vz.value !== "1") M.callar(); });

  $("#rutinas").innerHTML = M.ROUT.map(r => `<button class="rutina" type="button" data-r="${r.id}" id="r-${r.id}">
    <div class="mini"></div><span class="dato">${r.fact}</span><h2>${r.name}</h2>
    <span class="dur"><svg class="ico"><use href="#i-play"/></svg>${M.fmt(M.duracion(r))} min · Empezar</span>
    <ol>${r.steps.map(s => `<li>${s[0]}</li>`).join("")}</ol></button>`).join("");
  M.ROUT.forEach(r => M.Personaje.montar($(`#r-${r.id} .mini`), r.steps[0][3], { mini: true, estatico: true }));

  /* ---------- sesión de pausa a pantalla completa ---------- */
  const R = $("#reproductor"), ARO = 2 * Math.PI * 52, PREPARA = 5;
  let cur = null, i = -1, left = 0, total = 0, timer = null, pausado = false, figura = null, guia = [], cambio = false, previoFoco = null, globoPlan = false, globoEn = 0, globoHasta = 0;
  const conNombre = () => M.nombre() ? ", " + M.nombre() : "";
  const enFin = () => !$("#pFin").hidden;

  function ponerFigura(anim) {
    figura = M.Personaje.montar($("#escena"), anim);
    if (pausado) figura.pausar();
  }
  function segmentos() {
    $("#pSegmentos").innerHTML = cur.steps.map((_, k) => `<i class="${k < i ? "hecho" : ""}"><b${k === i ? ' id="pSegAhora"' : ""}></b></i>`).join("");
  }
  function reloj() {
    $("#pReloj").textContent = left >= 60 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : String(Math.max(0, left));
    $("#pAro").style.strokeDashoffset = ARO * (1 - left / total);
    const seg = $("#pSegAhora"); if (seg) seg.style.width = ((total - left) / total * 100) + "%";
  }
  function reiniciarAro() {
    const aro = $("#pAro"); aro.style.transition = "none"; reloj();
    void aro.getBoundingClientRect(); aro.style.transition = "";
  }

  /* guía de respiración: se calcula por segundo para que la pausa la detenga también */
  function prepararGuia(s) {
    guia = []; if (!s[4]) return;
    let t = 0;
    for (let r = 0; r < (s[5] || 1); r++) s[4].forEach(([txt, sec], k) => { guia.push({ at: t, txt: (k === 0 ? `${r + 1}. ` : "") + txt, sec, fase: k }); t += sec; });
  }
  function revisarGuia() {
    const g = guia.find(x => x.at === total - left); if (!g) return;
    $("#pIndicacion").textContent = g.txt; M.hablar(g.txt);
    const c = $("#pRespira"); c.style.transitionDuration = g.sec + "s";
    if (g.fase === 0) c.classList.add("dentro"); else if (g.fase === 2) c.classList.remove("dentro");
  }
  /* ejercicios a un lado: a la mitad del tiempo se avisa el cambio y la figura se voltea */
  function revisarLado() {
    const s = cur.steps[i];
    if (cambio || !/cambie/i.test(s[1]) || total - left < Math.floor(total / 2)) return;
    cambio = true;
    $("#escena").classList.add("espejo"); $("#pLado").hidden = false;
    setTimeout(() => { $("#pLado").hidden = true; }, 2500);
    M.hablar("Cambie de lado");
  }

  function preparar() {
    i = -1; left = total = PREPARA; guia = [];
    $("#pContador").textContent = "Prepárese"; $("#pAnuncio").textContent = "Prepárese. " + cur.intro;
    $("#pPaso").textContent = "Prepárese"; $("#pComo").textContent = cur.intro; $("#pIndicacion").textContent = "";
    $("#escena").classList.remove("espejo"); $("#pLado").hidden = true; $("#pRespira").hidden = true;
    ponerFigura(cur.steps[0][3]); segmentos(); reiniciarAro();
    M.hablar(`${M.saludo()}${conNombre()}. ${cur.intro}`);
  }
  function paso() {
    guia = []; cambio = false; globoPlan = false; $("#pGlobo").hidden = true;
    $("#escena").classList.remove("espejo"); $("#pLado").hidden = true; $("#pRespira").hidden = true;
    if (i >= cur.steps.length) { fin(); return; }
    const s = cur.steps[i]; left = total = s[2];
    const nivel = M.humor();
    globoPlan = !s[4] && s[2] >= 20 && (nivel === 2 ? i === 1 || i === 3 : nivel === 1 && i === 1);
    globoEn = Math.round(s[2] * 0.45);
    $("#pContador").textContent = `Paso ${i + 1} de ${cur.steps.length}`;
    $("#pPaso").textContent = s[0]; $("#pComo").textContent = s[1]; $("#pIndicacion").textContent = "";
    $("#pAnuncio").textContent = `Paso ${i + 1} de ${cur.steps.length}. ${s[0]}. ${s[1]}`;
    ponerFigura(s[3]); segmentos(); reiniciarAro();
    if (s[4]) { prepararGuia(s); const c = $("#pRespira"); c.hidden = false; c.classList.remove("dentro"); revisarGuia(); }
    else M.hablar(`${s[0]}. ${s[1]}`);
  }
  function fin() {
    clearInterval(timer); timer = null;
    if (figura) figura.detener();
    $("#pCuerpo").hidden = true; $("#pFin").hidden = false;
    $("#pAnuncio").textContent = "Pausa completada."; $("#pContador").textContent = "Terminada"; $("#pSegmentos").querySelectorAll("i").forEach(x => { x.className = "hecho"; x.firstChild.style.width = ""; });
    M.ls.set("mps_ultimaPausa", String(Date.now()));
    M.sumarPausa(cur.id);
    const n = M.pausasHoy().n;
    $("#pFinHoy").textContent = `Lleva ${n} ${n === 1 ? "pausa" : "pausas"} hoy.`;
    const msg = M.humor() > 0 ? M.mensajeFinal() : "";
    $("#pFinTxt").textContent = msg || "Vuelva a su puesto con la espalda apoyada en el respaldo.";
    $("#pFinNota").hidden = !msg;
    const nuevas = M.nuevasInsignias();
    $("#pFinInsignia").hidden = !nuevas.length;
    $("#pFinInsigniaTxt").textContent = nuevas.length ? `${nuevas.length === 1 ? "Nueva insignia" : "Nuevas insignias"}: ${nuevas.map(x => x.nombre).join(", ")}` : "";
    M.hablar(msg ? `Muy bien${conNombre()}. ${msg}${nuevas.length ? " Ganó la insignia " + nuevas[0].nombre + "." : ""}`
                 : `Muy bien${conNombre()}. Terminaste la pausa. Vuelve a tu puesto con la espalda apoyada.`);
    $("#pVolver").focus();
  }
  /* frase del personaje: aparece al 45 % del paso, solo en algunos pasos y sin cruzarse con la guía de respiración */
  function revisarGlobo() {
    const t = total - left, g = $("#pGlobo");
    if (globoPlan && t === globoEn) {
      const f = M.fraseGlobo(cur.id);
      if (f) { g.textContent = f; g.hidden = false; globoHasta = t + 7; M.hablar(f); }
    } else if (!g.hidden && t >= globoHasta) g.hidden = true;
  }
  function tick() {
    if (pausado || !cur || enFin()) return;
    left--;
    if (i < 0) { if (left <= 0) { i = 0; paso(); } else reloj(); return; }
    if (left <= 0) { i++; paso(); return; }
    reloj(); revisarGuia(); revisarLado(); revisarGlobo();
  }
  function pausar(estado) {
    if (!cur || enFin()) return;
    pausado = estado === undefined ? !pausado : estado;
    R.classList.toggle("pausado", pausado);
    if (figura) pausado ? figura.pausar() : figura.reanudar();
    if (pausado) M.callar();
    $("#pPausar").setAttribute("aria-label", pausado ? "Continuar" : "Pausar");
    $("#pPausar use").setAttribute("href", pausado ? "#i-play" : "#i-pausar");
    if (pausado) $("#pIndicacion").textContent = "En pausa";
    else if ($("#pIndicacion").textContent === "En pausa") $("#pIndicacion").textContent = "";
  }
  function mover(d) {
    if (!cur || enFin()) return;
    i = Math.max(0, i + d); paso();
  }
  function cerrar() {
    clearInterval(timer); timer = null;
    if (figura) figura.detener();
    cur = null; R.hidden = true; document.body.classList.remove("en-pausa");
    $(".app").inert = false;
    M.callar(); M.refrescar();
    if (previoFoco && previoFoco.isConnected) previoFoco.focus({ preventScroll: true });
    previoFoco = null;
  }

  M.iniciarPausa = function (id) {
    cur = M.ROUT.find(r => r.id === id); if (!cur) return;
    pausado = false; pausar(false);
    if (R.hidden) previoFoco = document.activeElement;
    R.hidden = false; document.body.classList.add("en-pausa"); $(".app").inert = true;
    $("#pCuerpo").hidden = false; $("#pFin").hidden = true; $("#pGlobo").hidden = true; M.reiniciarFrases();
    $("#pTitulo").textContent = "Pausa · " + cur.name;
    $("#pVoz").checked = $("#voz").value === "1";
    preparar();
    clearInterval(timer); timer = setInterval(tick, 1000);
    $("#pPausar").focus();
  };

  $("#rutinas").addEventListener("click", e => { const b = e.target.closest("[data-r]"); if (b) M.iniciarPausa(b.dataset.r); });
  $("#pPausar").addEventListener("click", () => pausar());
  $("#pSiguiente").addEventListener("click", () => mover(1));
  $("#pAnterior").addEventListener("click", () => mover(-1));
  $("#pTerminar").addEventListener("click", cerrar);
  $("#pVolver").addEventListener("click", () => { cerrar(); M.mostrar("hoy"); });
  $("#pOtra").addEventListener("click", () => { cerrar(); M.mostrar("pausas"); });
  $("#pVoz").addEventListener("change", e => { vz.value = e.target.checked ? "1" : "0"; vz.dispatchEvent(new Event("change")); });
  document.addEventListener("keydown", e => {
    if (R.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); cerrar(); return; }
    if (e.key === "Tab") {   /* el foco da la vuelta dentro de la pausa */
      const f = [...R.querySelectorAll("button,input,a[href]")].filter(x => x.offsetParent !== null && !x.disabled);
      if (!f.length) return;
      const primero = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && (e.target === primero || !R.contains(e.target))) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && (e.target === ultimo || !R.contains(e.target))) { e.preventDefault(); primero.focus(); }
      return;
    }
    if (/^(BUTTON|INPUT|SELECT)$/.test(e.target.tagName) && (e.key === " " || e.key === "Enter")) return;
    if (e.key === " ") { e.preventDefault(); pausar(); }
    else if (e.key === "ArrowRight") mover(1);
    else if (e.key === "ArrowLeft") mover(-1);
  });

  /* ---------- agenda de pausas (archivo de calendario .ics) ---------- */
  const DEF = [["08:00", "respira"], ["10:00", "cuello"], ["11:30", "ojos"], ["14:30", "lumbar"], ["16:00", "brazo"], ["17:00", "piernas"]];
  let saved = null; try { saved = JSON.parse(M.ls.get("mps_agenda") || "null"); } catch (e) {}
  const filas = Array.isArray(saved) && saved.length === DEF.length ? saved : DEF.map(([t, r]) => ({ on: true, t, r }));
  $("#agenda").innerHTML = filas.map((x, k) => `<div class="franja">
    <input type="checkbox" id="on${k}" ${x.on ? "checked" : ""} aria-label="Incluir pausa ${k + 1}">
    <input type="time" id="t${k}" value="${x.t}" aria-label="Hora de la pausa ${k + 1}">
    <select id="p${k}" aria-label="Rutina de la pausa ${k + 1}">${M.ROUT.map(r => `<option value="${r.id}" ${r.id === x.r ? "selected" : ""}>${r.name}</option>`).join("")}</select></div>`).join("");
  const leerFilas = () => filas.map((_, k) => ({ on: $("#on" + k).checked, t: $("#t" + k).value, r: $("#p" + k).value }));
  M.leerAgenda = leerFilas;
  $("#agenda").addEventListener("change", () => M.ls.set("mps_agenda", JSON.stringify(leerFilas())));

  function urlApp() {
    if (M.APP_URL) return M.APP_URL.replace(/#.*$/, "");
    return /^https?:/.test(location.protocol) ? location.href.replace(/#.*$/, "") : "";
  }
  $("#bIcs").addEventListener("click", () => {
    const note = $("#notaAgenda");
    const lista = leerFilas().filter(x => x.on && /^\d{2}:\d{2}$/.test(x.t));
    if (!lista.length) { note.textContent = "Active al menos una pausa con su hora."; return; }
    const d = new Date(); d.setDate(d.getDate() + 1);
    const ymd = d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const n = M.nombre(), base = urlApp();
    const icsEsc = t => t.replace(/([,;\\])/g, "\\$1");
    const ev = lista.map((x, k) => {
      const r = M.ROUT.find(y => y.id === x.r);
      const titulo = icsEsc(`${n ? n + ", " : ""}pausa: ${r.name}`);
      const url = base ? base + "#pausa-" + r.id : "";
      return ["BEGIN:VEVENT", "UID:mps-" + Date.now() + "-" + k + "@mipuestosaludable", "DTSTAMP:" + stamp,
        `DTSTART;TZID=America/Bogota:${ymd}T${x.t.replace(":", "")}00`, "DURATION:PT5M",
        `RRULE:FREQ=WEEKLY;BYDAY=${$("#dias").value}`, "SUMMARY:" + titulo,
        "DESCRIPTION:" + icsEsc(r.intro + (url ? " Abra la pausa guiada: " + url : " Abra Reset Corporal para hacer la pausa guiada.")),
        ...(url ? ["URL:" + url] : []),
        "BEGIN:VALARM", "ACTION:AUDIO", "TRIGGER:PT0M", "END:VALARM",
        "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + titulo, "TRIGGER:PT0M", "END:VALARM", "END:VEVENT"].join("\r\n");
    });
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Reset Corporal//ES", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Mis pausas activas",
      "BEGIN:VTIMEZONE", "TZID:America/Bogota", "BEGIN:STANDARD", "DTSTART:19700101T000000", "TZOFFSETFROM:-0500", "TZOFFSETTO:-0500", "TZNAME:-05", "END:STANDARD", "END:VTIMEZONE",
      ...ev, "END:VCALENDAR"].join("\r\n");
    M.descargar("mis-pausas-activas.ics", ics, "text/calendar");
    note.textContent = `Listo: ${lista.length} ${lista.length === 1 ? "pausa diaria" : "pausas diarias"}. Abra el archivo descargado y elija «Agregar» o «Importar» en su calendario.`;
  });

  /* llegada desde el calendario: #pausa-cuello abre la pestaña con esa rutina marcada */
  const m = /^#pausa-([a-z]+)$/.exec(location.hash || "");
  if (m && M.ROUT.some(r => r.id === m[1])) {
    M.mostrar("pausas");
    const card = $("#r-" + m[1]); card.classList.add("sel");
    setTimeout(() => card.scrollIntoView({ block: "center" }), 300);
  }
})(window.MPS);
