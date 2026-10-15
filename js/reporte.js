/* reporte.js - módulo «¿Le duele algo?»: versión corta del Cuestionario Nórdico con mapa del cuerpo y alertas para SST.
   Alerta si: intensidad >= 7, impidió trabajar o la misma zona se repite en 30 días. */
(function (M) {
  "use strict";
  const { $, $$, esc } = M;
  const DIAS_REPETICION = 30;
  const nivelTxt = v => v <= 3 ? "leve" : v <= 6 ? "moderada" : "fuerte";
  const etiqueta = v => `Intensidad ${v} de 10 · ${nivelTxt(v)}`;
  const AYUDA = "Toque la zona donde siente la molestia.";

  /* ---------- mapa del cuerpo (silueta propia en SVG, coordenadas de un lienzo de 220 x 420) ---------- */
  const ZONAS = {                       /* zona -> puntos donde se dibuja (izquierda y derecha del cuerpo) */
    cuello: [[110, 70]], hombro: [[66, 96], [154, 96]], espalda_alta: [[110, 120]], codo: [[50, 152], [170, 152]],
    muneca: [[44, 212], [176, 212]], espalda_baja: [[110, 172]], cadera: [[90, 218], [130, 218]],
    rodilla: [[90, 292], [130, 292]], tobillo: [[89, 374], [131, 374]]
  };
  const SOLO_ESPALDA = ["espalda_alta", "espalda_baja"];
  const linea = (x1, y1, x2, y2, w) => `<line class="cuerpo-l" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${w}"/>`;

  function dibujarCuerpo() {
    const par = f => [0, 1].map(f).join("");
    const X = (x, k) => k ? 220 - x : x;
    const cuerpo =
      par(k => linea(X(90, k), 200, X(90, k), 290, 30) + linea(X(90, k), 290, X(89, k), 372, 24) + `<ellipse class="cuerpo-f" cx="${X(86, k)}" cy="394" rx="17" ry="8"/>`) +
      `<rect class="cuerpo-f" x="68" y="78" width="84" height="126" rx="32"/>` +
      par(k => linea(X(66, k), 96, X(50, k), 152, 22) + linea(X(50, k), 152, X(44, k), 206, 18) + `<circle class="cuerpo-f" cx="${X(43, k)}" cy="216" r="10"/>`) +
      linea(110, 56, 110, 80, 18) + `<circle class="cuerpo-f" cx="110" cy="34" r="24"/>` +
      `<g class="solo-frente"><circle class="cuerpo-rasgo" cx="101" cy="32" r="2.4"/><circle class="cuerpo-rasgo" cx="119" cy="32" r="2.4"/><path class="cuerpo-rasgo-l" d="M103,42 q7,5 14,0"/></g>` +
      `<path class="solo-espalda cuerpo-pelo" d="M86,34 a24,24 0 0 1 48,0 q0,12 -7,24 h-34 q-7,-12 -7,-24z"/>`;
    const zonas = M.SEGS.map(([k, nombre]) => `<g class="zona-mapa${SOLO_ESPALDA.includes(k) ? " solo-espalda" : ""}" data-zona="${k}" data-nombre="${esc(nombre)}" role="checkbox" aria-checked="false" aria-label="${esc(nombre)}" tabindex="0">
      ${ZONAS[k].map(([x, y]) => `<circle class="zm-anillo" cx="${x}" cy="${y}" r="17"/><text class="zm-num" x="${x}" y="${y}"></text>`).join("")}</g>`).join("");
    return `<svg id="mapaCuerpo" viewBox="0 0 220 420" data-vista="frente" role="group" aria-label="Mapa del cuerpo">${cuerpo}${zonas}</svg>`;
  }

  $("#mapa").innerHTML = `
    <div class="alterna" role="group" aria-label="Vista del cuerpo">
      <button type="button" data-vista="frente" aria-pressed="true">Frente</button>
      <button type="button" data-vista="espalda" aria-pressed="false">Espalda</button>
    </div>${dibujarCuerpo()}<p class="nota mapa-ayuda" id="mapaEtiqueta">${AYUDA}</p>`;
  const mapa = $("#mapaCuerpo");

  /* ---------- tarjetas de zonas: alternativa al mapa y control de intensidad ---------- */
  $("#zonas").innerHTML = M.SEGS.map(([k, n]) => `<div class="zona"><label><input type="checkbox" data-seg="${k}" id="s_${k}">${n}</label>
    <div hidden id="w_${k}"><input type="range" min="1" max="10" value="4" id="i_${k}" aria-label="Intensidad en ${n}"><span class="nivel" id="l_${k}">${etiqueta(4)}</span></div></div>`).join("");

  /* deja el mapa igual que las tarjetas: zonas marcadas, intensidad en el círculo */
  function sincronizar() {
    $$(".zona-mapa").forEach(g => {
      const k = g.dataset.zona, marcada = $("#s_" + k).checked;
      g.classList.toggle("sel", marcada); g.setAttribute("aria-checked", String(marcada));
      g.querySelectorAll(".zm-num").forEach(t => { t.textContent = marcada ? $("#i_" + k).value : ""; });
    });
  }
  $("#zonas").addEventListener("input", e => {
    const el = e.target;
    if (el.dataset.seg) $("#w_" + el.dataset.seg).hidden = !el.checked;
    else if (el.type === "range") $("#l_" + el.id.slice(2)).textContent = etiqueta(+el.value);
    sincronizar();
  });

  function alternar(k) {
    const cb = $("#s_" + k); cb.checked = !cb.checked;
    cb.dispatchEvent(new Event("input", { bubbles: true }));
    if (cb.checked) $("#i_" + k).focus({ preventScroll: true });
  }
  mapa.addEventListener("click", e => { const g = e.target.closest(".zona-mapa"); if (g) alternar(g.dataset.zona); });
  mapa.addEventListener("keydown", e => {
    const g = e.target.closest(".zona-mapa");
    if (g && (e.key === " " || e.key === "Enter")) { e.preventDefault(); alternar(g.dataset.zona); }
  });
  const ponerAyuda = t => { $("#mapaEtiqueta").textContent = t; };
  mapa.addEventListener("mouseover", e => { const g = e.target.closest(".zona-mapa"); if (g) ponerAyuda(g.dataset.nombre); });
  mapa.addEventListener("mouseleave", () => ponerAyuda(AYUDA));
  mapa.addEventListener("focusin", e => { const g = e.target.closest(".zona-mapa"); if (g) ponerAyuda(g.dataset.nombre); });
  $(".alterna").addEventListener("click", e => {
    const b = e.target.closest("[data-vista]"); if (!b) return;
    mapa.dataset.vista = b.dataset.vista;
    $$(".alterna button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  });

  /* ---------- envío ---------- */
  $("#fReporte").addEventListener("submit", async e => {
    e.preventDefault();
    const out = $("#rReporte");
    const segs = M.SEGS.filter(([k]) => $("#s_" + k).checked).map(([k]) => ({ seg: k, int: +$("#i_" + k).value }));
    const impide = new FormData(e.target).get("impide") === "si";
    if (!segs.length) {
      out.hidden = false;
      out.innerHTML = '<div class="msg ok">Sin molestias esta semana. Siga con sus pausas y ajustes del puesto.</div>';
      return;
    }
    const p = await M.conPerfil(); if (!p) return;
    const desde = Date.now() - DIAS_REPETICION * 864e5;
    const previos = M.leer("reportes").filter(r => r.codigo === p.codigo && Date.parse(r.fecha) > desde);
    const repetidos = segs.filter(s => previos.some(r => r.segmentos.some(x => x.seg === s.seg))).map(s => s.seg);
    const max = Math.max(...segs.map(s => s.int));
    const alerta = impide || max >= 7 || repetidos.length > 0;
    const rec = { ...p, segmentos: segs, impide, maxInt: max, alerta, repetidos, fecha: new Date().toISOString() };
    const estado = M.guardar("reportes", rec);

    /* ofrece la pausa de la zona más intensa; con dolor fuerte se pide consultar a SST primero (CONTEXTO.md, 5.3) */
    const fuerte = impide || max >= 7;
    const zona = [...segs].sort((a, b) => b.int - a.int).find(s => M.RUTINA_ZONA[s.seg]);
    const rutina = zona && M.ROUT.find(r => r.id === M.RUTINA_ZONA[zona.seg]);
    out.hidden = false;
    out.innerHTML = `<div class="msg ${alerta ? "bad" : "info"}">${alerta
      ? "Su reporte generó una alerta: el equipo de SST lo contactará para revisar su caso."
      : "Reporte recibido. Gracias por contarnos cómo se siente."}</div>
      ${fuerte ? '<div class="msg warn" style="margin-top:10px">Por la intensidad de su dolor, consulte a SST antes de hacer ejercicios en esa zona.</div>'
        : rutina ? `<div class="fila" style="margin-top:12px"><button class="btn" type="button" data-pausa="${esc(rutina.id)}"><svg class="ico"><use href="#i-play"/></svg>Hacer la pausa para ${esc(M.SEGNAME[zona.seg].toLowerCase())}</button></div>` : ""}
      <p class="nota" style="margin-top:8px">${estado}</p>`;
    out.focus({ preventScroll: true }); out.scrollIntoView({ behavior: "smooth", block: "nearest" });
    e.target.reset();
    M.SEGS.forEach(([k]) => { $("#w_" + k).hidden = true; $("#l_" + k).textContent = etiqueta(4); });
    sincronizar();
  });
  $("#rReporte").addEventListener("click", e => { const b = e.target.closest("[data-pausa]"); if (b) M.iniciarPausa(b.dataset.pausa); });
})(window.MPS);
