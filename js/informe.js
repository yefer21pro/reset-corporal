/* informe.js - «Mi reporte»: resumen personal de lo registrado en este equipo, para imprimir (PDF) o descargar (CSV).
   Sin PIN: cada trabajador ve y entrega solo sus propios datos. El nombre nunca entra en el reporte. */
(function (M) {
  "use strict";
  const { $, esc, fmt } = M;

  const CORTO = { respaldo: "Apoyo de la espalda", reposabrazos: "Reposabrazos", raton: "Ubicación del ratón", pantalla: "Altura de la pantalla", pies: "Apoyo de los pies", atril: "Portadocumentos", tiempo: "Más de 4 horas frente al computador" };
  const NIVEL = { verde: ["ok", "Verde · puesto adecuado"], amarillo: ["warn", "Amarillo · ajustes necesarios"], rojo: ["bad", "Rojo · riesgo alto"] };
  const ESTADO = { no: "No aplica", necesito: "Lo necesito", recibido: "Ya me lo entregaron" };
  const fecha = iso => new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  const fechaHora = iso => new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;

  /* ---------- datos del periodo elegido ---------- */
  function reunir() {
    const dias = +$("#infPeriodo").value, desde = dias ? Date.now() - dias * 864e5 : 0;
    const p = M.perfil();
    const mio = r => !p.codigo || r.codigo === p.codigo;
    const en = r => Date.parse(r.fecha) >= desde;
    const orden = (a, b) => b.fecha.localeCompare(a.fecha);
    return {
      p, dias, desde,
      ev: M.leer("evaluaciones").filter(r => mio(r) && en(r)).sort(orden),
      rep: M.leer("reportes").filter(r => mio(r) && en(r)).sort(orden),
      pau: M.leer("pausas").filter(en).sort(orden),
      el: M.leerElementos()
    };
  }
  const pendientes = ev => M.Q.filter(q => (q.inv ? ev.respuestas[q.id] === "si" : ev.respuestas[q.id] === "no")).map(q => CORTO[q.id] || q.id);
  const motivo = r => [r.impide ? "Le impidió trabajar" : "", r.maxInt >= 7 ? "Dolor de 7 o más" : "", r.repetidos && r.repetidos.length ? "Zona repetida en 30 días" : ""].filter(Boolean).join(" · ");
  const periodoTxt = d => d.dias ? `${fecha(d.desde)} al ${fecha(new Date().toISOString())}` : "Todo lo registrado en este equipo";

  /* ---------- reporte en pantalla (es el mismo que se imprime) ---------- */
  function tabla(cabeza, filas, vacio) {
    if (!filas.length) return `<p class="vacio">${vacio}</p>`;
    return `<div class="tabla" tabindex="0" role="group" aria-label="Tabla del reporte"><table><thead><tr>${cabeza.map(c => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>${filas.map(f => `<tr>${f.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function pintar() {
    const d = reunir(), p = d.p;
    const dias = new Set(d.pau.map(x => new Date(x.fecha).toLocaleDateString("en-CA"))).size;
    const ultimo = d.ev[0], alertas = d.rep.filter(r => r.alerta).length;
    const porRutina = M.ROUT.map(r => ({ r, n: d.pau.filter(x => x.rutina === r.id).length })).filter(x => x.n);
    const elementos = M.ELEM_DEF ? Object.entries(M.ELEM_DEF).filter(([k]) => d.el[k] && d.el[k] !== "no") : [];
    const vacio = !d.ev.length && !d.rep.length && !d.pau.length && !elementos.length;

    $("#informe").innerHTML = `
      <header class="inf-cab">
        <svg class="marca-icono" aria-hidden="true"><use href="#logo-app"/></svg>
        <div><p class="etiqueta-sec">Reset Corporal · Mi Puesto Saludable IPS · Santa Marta</p><h2>Reporte personal de autocuidado</h2></div>
      </header>
      <dl class="inf-datos">
        <div><dt>Código del trabajador</dt><dd>${esc(p.codigo) || "Sin registrar"}</dd></div>
        <div><dt>Tipo de vinculación</dt><dd>${esc(p.grupo) || "Sin registrar"}</dd></div>
        <div><dt>Área</dt><dd>${esc(p.area) || "Sin registrar"}</dd></div>
        <div><dt>Periodo</dt><dd>${esc(periodoTxt(d))}</dd></div>
        <div><dt>Generado el</dt><dd>${esc(fechaHora(new Date().toISOString()))}</dd></div>
      </dl>
      ${p.codigo ? "" : '<p class="inf-aviso">Aún no ha escrito su código. SST lo necesita para reconocer su reporte: escríbalo en «Mis datos y recordatorios».</p>'}
      ${vacio ? '<p class="vacio">No hay registros en este periodo. Haga una pausa, revise su puesto o reporte una molestia y vuelva aquí.</p>' : ""}
      <section aria-labelledby="inf-r"><h3 id="inf-r">Resumen</h3><div class="inf-resumen">
        <div class="inf-cifra"><b>${d.pau.length}</b><span>${d.pau.length === 1 ? "pausa activa hecha" : "pausas activas hechas"}</span></div>
        <div class="inf-cifra"><b>${dias}</b><span>${dias === 1 ? "día con pausas" : "días con pausas"}</span></div>
        <div class="inf-cifra"><b>${d.ev.length}</b><span>${d.ev.length === 1 ? "revisión del puesto" : "revisiones del puesto"}${ultimo ? ` · última: ${NIVEL[ultimo.nivel][1].split(" · ")[0].toLowerCase()}` : ""}</span></div>
        <div class="inf-cifra"><b>${d.rep.length}</b><span>${d.rep.length === 1 ? "reporte de molestias" : "reportes de molestias"}${alertas ? ` · ${plural(alertas, "con alerta", "con alerta")}` : ""}</span></div>
      </div></section>
      <section aria-labelledby="inf-p"><h3 id="inf-p">Revisiones de mi puesto</h3>${tabla(["Fecha", "Resultado", "Puntaje", "Ajustes pendientes"],
        d.ev.map(e => [fecha(e.fecha), `<span class="etiqueta ${NIVEL[e.nivel][0]}">${NIVEL[e.nivel][1]}</span>`, e.puntaje, esc(pendientes(e).join(", ") || "Ninguno")]),
        "No hizo revisiones del puesto en este periodo.")}</section>
      <section aria-labelledby="inf-m"><h3 id="inf-m">Molestias reportadas</h3>${tabla(["Fecha", "Zonas (intensidad de 1 a 10)", "Le impidió trabajar", "Alerta para SST"],
        d.rep.map(r => [fecha(r.fecha), esc(r.segmentos.map(s => `${M.SEGNAME[s.seg] || s.seg} (${s.int})`).join(", ")), r.impide ? "Sí" : "No", r.alerta ? `<span class="etiqueta bad">${esc(motivo(r) || "Sí")}</span>` : "No"]),
        "No reportó molestias en este periodo.")}</section>
      <section aria-labelledby="inf-a"><h3 id="inf-a">Pausas activas</h3>${tabla(["Rutina", "Veces", "Última vez"],
        porRutina.map(x => [esc(x.r.name), x.n, fecha(d.pau.find(y => y.rutina === x.r.id).fecha)]),
        "No hizo pausas guiadas en este periodo.")}</section>
      <section aria-labelledby="inf-e"><h3 id="inf-e">Elementos de apoyo</h3>${tabla(["Elemento", "Estado"],
        elementos.map(([k, [n]]) => [esc(n), ESTADO[d.el[k]]]), "No marcó elementos de apoyo.")}</section>
      <p class="inf-pie">Este documento contiene datos de salud y se generó en el equipo del trabajador. Compártalo solo con el equipo de Seguridad y Salud en el Trabajo (Ley 1581 de 2012). No incluye su nombre.</p>`;
  }

  /* ---------- elementos de apoyo: los marca el trabajador ---------- */
  function pintarElementos() {
    const it = M.leerElementos();
    $("#infElementosLista").innerHTML = Object.entries(M.ELEM_DEF).map(([k, [n]]) =>
      `<div class="elem-fila"><label for="el_${k}">${esc(n)}</label><select id="el_${k}" data-el="${k}">${Object.entries(ESTADO).map(([v, t]) => `<option value="${v}"${(it[k] || "no") === v ? " selected" : ""}>${t}</option>`).join("")}</select></div>`).join("");
  }
  $("#infElementosLista").addEventListener("change", e => {
    const k = e.target.dataset.el; if (!k) return;
    const it = M.leerElementos(); it[k] = e.target.value; M.guardarElementos(it); pintar();
  });

  /* ---------- CSV (formato largo: una fila por dato, fácil de juntar en Excel) ---------- */
  M.informeCsv = function () {
    const d = reunir(), p = d.p, base = r => [r.codigo || p.codigo, r.grupo || p.grupo, r.area || p.area];
    const filas = [];
    d.ev.forEach(e => filas.push([...base(e), "revision_puesto", e.fecha, e.nivel, e.puntaje, "", "", pendientes(e).join("; ")]));
    d.rep.forEach(r => r.segmentos.forEach(s => filas.push([...base(r), "molestia", r.fecha, M.SEGNAME[s.seg] || s.seg, s.int, r.impide ? "si" : "no", r.alerta ? "si" : "no", motivo(r)])));
    d.pau.forEach(x => filas.push([p.codigo, p.grupo, p.area, "pausa", x.fecha, (M.ROUT.find(r => r.id === x.rutina) || { name: x.rutina }).name, 1, "", "", ""]));
    Object.entries(M.ELEM_DEF).forEach(([k, [n]]) => { if (d.el[k] && d.el[k] !== "no") filas.push([p.codigo, p.grupo, p.area, "elemento_apoyo", "", n, ESTADO[d.el[k]], "", "", ""]); });
    return M.csv(["codigo", "vinculacion", "area", "tipo", "fecha", "concepto", "valor", "impidio_trabajar", "alerta", "detalle"], filas);
  };

  const hoyTxt = () => new Date().toISOString().slice(0, 10);
  const marcar = () => M.ls.set("mps_ultimoReporte", String(Date.now()));
  $("#infCsv").addEventListener("click", () => {
    M.descargar(`mi-reporte-${(M.perfil().codigo || "sin-codigo").toLowerCase()}-${hoyTxt()}.csv`, M.informeCsv(), "text/csv;charset=utf-8");
    marcar(); $("#infAviso").textContent = "Descargado. Revise su carpeta de Descargas y envíelo a SST por el medio que ellos le indiquen.";
  });
  $("#infPdf").addEventListener("click", () => {
    const previo = document.title;
    document.title = `Mi reporte ${(M.perfil().codigo || "sin código")} ${hoyTxt()}`;   /* sugiere el nombre del archivo PDF */
    window.addEventListener("afterprint", () => { document.title = previo; }, { once: true });
    marcar(); $("#infAviso").textContent = "En el cuadro de impresión elija «Guardar como PDF» como destino.";
    window.print();
  });
  $("#infPeriodo").addEventListener("change", pintar);
  M.alMostrar("informe", () => { pintarElementos(); pintar(); $("#infAviso").textContent = ""; });
})(window.MPS);
