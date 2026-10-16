/* hoy.js - pantalla de entrada: pausa recomendada, pausas de hoy, próxima pausa y estado del puesto.
   Se carga al final porque usa funciones de los demás módulos. */
(function (M) {
  "use strict";
  const { $, esc } = M;

  /* reglas de CONTEXTO.md (5.3): qué rutina corresponde a cada molestia o hallazgo del puesto */
  const RUTINA_ZONA = M.RUTINA_ZONA;
  const RUTINA_PUESTO = [
    ["pantalla", "no", "cuello", "su pantalla está baja"],
    ["respaldo", "no", "lumbar", "su espalda no tiene apoyo en el respaldo"],
    ["reposabrazos", "no", "brazo", "sus brazos no tienen apoyo"],
    ["raton", "no", "brazo", "su ratón está lejos del teclado"],
    ["pies", "no", "piernas", "sus pies no tienen apoyo"],
    ["tiempo", "si", "ojos", "pasa más de 4 horas frente al computador"]
  ];
  const rutina = id => M.ROUT.find(r => r.id === id);
  const hhmm = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  const agenda = () => (M.leerAgenda ? M.leerAgenda() : []).filter(x => x.on && /^\d{2}:\d{2}$/.test(x.t)).sort((a, b) => a.t.localeCompare(b.t));

  function ultimoDe(col, codigo) {
    if (!codigo) return null;
    return M.leer(col).filter(r => r.codigo === codigo).sort((a, b) => b.fecha.localeCompare(a.fecha))[0] || null;
  }

  /* candidatos en orden de prioridad; se elige el primero que no se haya hecho hoy */
  function recomendar() {
    const hechas = M.pausasHoy().rutinas, cod = M.perfil().codigo, c = [];
    if (!hechas.length && new Date().getHours() < 10) c.push(["respira", "Para empezar la jornada con calma."]);
    const rep = ultimoDe("reportes", cod);
    if (rep && Date.now() - Date.parse(rep.fecha) < 7 * 864e5) {
      const fuerte = rep.impide || rep.maxInt >= 7;
      [...rep.segmentos].sort((a, b) => b.int - a.int).forEach(s => {
        if (RUTINA_ZONA[s.seg]) c.push([RUTINA_ZONA[s.seg], `Porque reportó molestias en ${M.SEGNAME[s.seg].toLowerCase()}.` +
          (fuerte ? " Si el dolor es fuerte, consulte a SST antes de hacer ejercicios en esa zona." : "")]);
      });
    }
    const ev = ultimoDe("evaluaciones", cod);
    if (ev) RUTINA_PUESTO.forEach(([q, malo, r, txt]) => { if (ev.respuestas[q] === malo) c.push([r, `Porque en la revisión de su puesto, ${txt}.`]); });
    const ag = agenda(), ahora = hhmm();
    const actual = ag.filter(x => x.t <= ahora).pop();
    if (actual) c.push([actual.r, `Según su agenda de las ${actual.t}.`]);
    ag.forEach(x => c.push([x.r, "Para seguir con su agenda del día."]));
    c.push(["cuello", "El cuello es la zona con más molestias en la IPS (63,2 %)."]);
    return c.find(([r]) => !hechas.includes(r)) || c[0];
  }

  M.recomendada = () => recomendar();
  function pintarInsignias() {
    const l = M.insignias().sort((a, b) => b.ganada - a.ganada), g = l.filter(x => x.ganada).length;
    $("#insigniasResumen").textContent = `${g} de ${l.length} ganadas`;
    const rec = l.filter(x => x.ganada).slice(-4).reverse();
    $("#insigniasRecientes").innerHTML = rec.length
      ? rec.map(i => `<span class="chip-ins"><svg class="ico" aria-hidden="true"><use href="#i-medalla"/></svg>${esc(i.nombre)}</span>`).join("")
      : `<p class="nota">Todavía no tiene insignias: la primera llega con su primera pausa.</p>`;
    $("#insigniasLista").innerHTML = l.map(i => `<div class="insignia ${i.ganada ? "ganada" : "bloqueada"}"><span class="ins-ico"><svg class="ico" aria-hidden="true"><use href="#i-medalla"/></svg></span><div><b>${esc(i.nombre)}</b><small>${i.ganada ? "Ganada" : `${i.valor} de ${i.meta} · ${esc(i.desc)}`}</small></div></div>`).join("");
  }
  let recomendada = "cuello";
  function pintar() {
    const n = M.nombre();
    $("#hoySaludo").textContent = M.saludo() + (n ? ", " + n : "");
    const humor = M.humor();
    $("#hoyBroma").hidden = humor < 1; if (humor) $("#hoyBroma").textContent = M.bromaSaludo();
    $("#hoyChiste").hidden = humor < 2; if (humor > 1) $("#hoyChisteTxt").textContent = M.chisteDelDia();
    pintarInsignias();
    $("#hoyPideNombre").hidden = !!n;

    const [id, motivo] = recomendar(); const r = rutina(id); recomendada = id;
    $("#hoyRutina").textContent = r.name;
    $("#hoyMotivo").textContent = motivo;
    $("#hoyDur").textContent = M.fmt(M.duracion(r)) + " min";
    M.Personaje.montar($("#hoyFigura"), r.steps[0][3], { mini: true });
    /* el personaje habla: una frase de la rutina recomendada; al tocarlo dice otra */
    const g = $("#hoyGlobo"); g.hidden = humor < 1;
    if (humor >= 1) g.textContent = M.fraseNueva(id);
    $("#hoyFiguraBtn").disabled = humor < 1;

    const ag = agenda(), meta = Math.max(ag.length, 1), hechas = M.pausasHoy().n;
    $("#hoyHechas").textContent = hechas; $("#hoyMeta").textContent = meta;
    $("#hoyProgreso").innerHTML = Array.from({ length: meta }, (_, k) => `<i class="${k < hechas ? "hecho" : ""}"></i>`).join("");
    const prox = ag.find(x => x.t > hhmm());
    $("#hoyProxima").innerHTML = prox ? `<b>${prox.t}</b>` : "<b>—</b>";
    $("#hoyProximaQue").textContent = prox ? rutina(prox.r).name : ag.length ? "Terminó su agenda de hoy." : "Configure su agenda en «Mis datos».";

    const rec = +$("#recCada").value;
    $("#hoyRec").checked = rec > 0;
    $("#hoyRecTxt").textContent = rec ? `Cada ${rec} minutos` : "Desactivado";

    const ev = ultimoDe("evaluaciones", M.perfil().codigo);
    const NIV = { verde: ["ok", "Puesto adecuado"], amarillo: ["warn", "Ajustes necesarios"], rojo: ["bad", "Riesgo alto"] };
    $("#hoyPuesto").innerHTML = ev
      ? `<span class="etiqueta ${NIV[ev.nivel][0]}">${NIV[ev.nivel][1]}</span> · ${esc(new Date(ev.fecha).toLocaleDateString("es-CO"))}`
      : "Revíselo en 2 minutos.";
    M.pintarSesion(); avisoReporte();
  }

  $("#hoyEmpezar").addEventListener("click", () => M.iniciarPausa(recomendada));
  $("#hoyFiguraBtn").addEventListener("click", () => { if (M.humor() > 0) { const g = $("#hoyGlobo"); g.textContent = M.fraseNueva(recomendada); g.hidden = false; g.style.animation = "none"; g.offsetWidth; g.style.animation = ""; } });
  $("#hoyGuardarNombre").addEventListener("click", () => {
    const v = $("#hoyNombre").value.trim(); if (!v) { $("#hoyNombre").focus(); return; }
    $("#nombre").value = v; M.ls.set("mps_nombre", v); pintar();
  });
  $("#hoyNombre").addEventListener("keydown", e => { if (e.key === "Enter") $("#hoyGuardarNombre").click(); });
  $("#hoyRec").addEventListener("change", e => {
    const sel = $("#recCada");
    if (+sel.value) M.ls.set("mps_recUltimo", sel.value);
    sel.value = e.target.checked ? (M.ls.get("mps_recUltimo") || "60") : "0";
    sel.dispatchEvent(new Event("change"));
    pintar();
  });
  /* aviso para descargar el reporte cada mes (solo si hay algo registrado) */
  const avRep = $("#avisoReporte");
  function avisoReporte() {
    const hay = M.leer("evaluaciones").length + M.leer("reportes").length + M.leer("pausas").length;
    const ultimo = +M.ls.get("mps_ultimoReporte") || 0, luego = +M.ls.get("mps_posponerReporte") || 0;
    avRep.hidden = !(hay && Date.now() - ultimo > 30 * 864e5 && Date.now() > luego);
  }
  $("#avisoReporteLuego").addEventListener("click", () => { M.ls.set("mps_posponerReporte", String(Date.now() + 7 * 864e5)); avisoReporte(); });

  /* aviso sobre dónde viven los datos: se muestra hasta que el trabajador lo descarta */
  const aviso = $("#avisoDatos");
  aviso.hidden = !!M.ls.get("mps_avisoDatos");
  $("#avisoDatosOk").addEventListener("click", () => { M.ls.set("mps_avisoDatos", "1"); aviso.hidden = true; });

  /* pide al navegador que no borre estos datos por su cuenta cuando falte espacio */
  let protegido = null;
  (async () => {
    try { if (navigator.storage && navigator.storage.persist) protegido = (await navigator.storage.persisted()) || (await navigator.storage.persist()); } catch (e) {}
    estadoDatos();
  })();
  function estadoDatos() {
    const ev = M.leer("evaluaciones").length, rep = M.leer("reportes").length;
    $("#estadoDatos").textContent = `En este navegador hay ${ev} ${ev === 1 ? "revisión" : "revisiones"} de puesto y ${rep} ${rep === 1 ? "reporte" : "reportes"} guardados. ` +
      (protegido ? "El navegador protegió estos datos contra el borrado automático." : "El navegador no confirmó la protección contra el borrado automático: siga las recomendaciones.");
  }
  M.alMostrar("ajustes", estadoDatos);
  M.alMostrar("hoy", pintar);

  /* entrada: #pausa-x la atiende pausas.js; las demás secciones por su nombre; si no, Hoy */
  const h = (location.hash || "").slice(1);
  if (!/^pausa-/.test(h)) M.mostrar(M.VISTAS.includes(h) ? h : "hoy");
  pintar();
})(window.MPS);
