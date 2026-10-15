/* puesto.js - módulo «Mi puesto»: autoevaluación basada en ROSA, una pregunta a la vez, con semáforo al final. */
(function (M) {
  "use strict";
  const { $, esc } = M;
  const f = $("#fPuesto"), out = $("#rPuesto");
  const N = M.Q.length;
  let idx = 0, resp = {}, espera = false;

  /* 0-1 puntos verde, 2-3 amarillo, 4 o más rojo */
  M.nivelPuesto = score => score <= 1 ? "verde" : score <= 3 ? "amarillo" : "rojo";

  function pintar() {
    const q = M.Q[idx];
    const opciones = [["si", "Sí"], ["no", "No"]];
    if (q.na) opciones.push(["na", "No transcribo de papel"]);
    f.innerHTML = `
      <div class="paso-cab">
        <span class="paso-num">Pregunta ${idx + 1} de ${N}</span>
        <div class="progreso" aria-hidden="true">${M.Q.map((_, k) => `<i class="${k < idx ? "hecho" : k === idx ? "ahora" : ""}"></i>`).join("")}</div>
      </div>
      <h2 class="paso-pregunta" id="pq">${q.t}</h2>
      <div class="paso-opciones" role="group" aria-labelledby="pq">${opciones.map(([v, t], k) =>
        `<button type="button" class="opcion-grande${resp[q.id] === v ? " sel" : ""}" data-v="${v}"><kbd>${k + 1}</kbd>${t}</button>`).join("")}</div>
      <div class="fila"><button type="button" class="btn discreto" data-atras${idx === 0 ? " hidden" : ""}>Atrás</button><span class="nota">Puede contestar con el mouse o con las teclas 1, 2 y 3.</span></div>`;
    const sel = f.querySelector(".opcion-grande.sel") || f.querySelector(".opcion-grande");
    if (sel && !f.closest("section").hidden) sel.focus({ preventScroll: true });
  }

  function responder(v) {
    if (espera) return;
    espera = true;
    resp[M.Q[idx].id] = v;
    f.querySelectorAll(".opcion-grande").forEach(b => b.classList.toggle("sel", b.dataset.v === v));
    setTimeout(() => {
      espera = false;
      if (idx < N - 1) { idx++; pintar(); } else terminar();
    }, 260);
  }

  async function terminar() {
    const p = await M.conPerfil();
    if (!p) { pintar(); return; }   /* canceló el recuadro: conserva sus respuestas */
    let score = 0; const fixes = [];
    M.Q.forEach(q => {
      const v = resp[q.id];
      const malo = q.inv ? v === "si" : v === "no";
      if (malo) { score += q.pts; fixes.push(q.fix); }
    });
    const nivel = M.nivelPuesto(score);
    const txt = {
      verde: ["Puesto adecuado", "Mantenga estos ajustes y haga sus pausas.", "ok"],
      amarillo: ["Ajustes necesarios", "Corrija los puntos de abajo hoy mismo.", "warn"],
      rojo: ["Riesgo alto", "Corrija lo que pueda y SST revisará su puesto.", "bad"]
    }[nivel];
    const rec = { ...p, respuestas: { ...resp }, puntaje: score, nivel, fecha: new Date().toISOString() };
    const estado = M.guardar("evaluaciones", rec);
    const [rid, motivo] = M.recomendada ? M.recomendada() : ["cuello", ""];
    const rutina = M.ROUT.find(r => r.id === rid);
    out.innerHTML = `<div class="semaforo"><div class="luces" aria-hidden="true"><i class="r ${nivel === "rojo" ? "on" : ""}"></i><i class="y ${nivel === "amarillo" ? "on" : ""}"></i><i class="g ${nivel === "verde" ? "on" : ""}"></i></div>
      <div><span class="etiqueta ${txt[2]}">${txt[0]} · ${score} ${score === 1 ? "punto" : "puntos"}</span>
      <h2 style="margin-top:10px">${txt[1]}</h2>
      ${fixes.length ? `<p class="nota" style="margin-top:6px">Marque cada ajuste cuando lo haga:</p><ul class="chequeo">${fixes.map(x => `<li><label><input type="checkbox"><span>${x}</span></label></li>`).join("")}</ul>` : ""}
      <div class="fila" style="margin-top:16px">
        <button class="btn" type="button" data-pausa="${esc(rid)}"><svg class="ico"><use href="#i-play"/></svg>Hacer una pausa: ${esc(rutina.name)}</button>
        <button class="btn sec" type="button" data-reiniciar>Revisar de nuevo</button>
      </div>
      <p class="nota" style="margin-top:12px">${estado}</p></div></div>`;
    f.hidden = true; out.hidden = false;
    out.focus({ preventScroll: true });
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  f.addEventListener("click", e => {
    const b = e.target.closest(".opcion-grande,[data-atras]"); if (!b) return;
    if (b.matches("[data-atras]")) { if (idx > 0) { idx--; pintar(); } } else responder(b.dataset.v);
  });
  /* teclas 1, 2 y 3 en toda la pantalla mientras se contesta (no si se está escribiendo o hay un recuadro abierto) */
  document.addEventListener("keydown", e => {
    if (f.hidden || f.closest("section").hidden || e.ctrlKey || e.altKey || e.metaKey) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName) || document.querySelector("dialog[open]") || !$("#reproductor").hidden) return;
    const b = f.querySelectorAll(".opcion-grande")["123".indexOf(e.key)];
    if (b) { e.preventDefault(); b.click(); }
  });
  f.addEventListener("submit", e => e.preventDefault());
  out.addEventListener("click", e => {
    const b = e.target.closest("[data-pausa],[data-reiniciar]"); if (!b) return;
    if (b.dataset.pausa) { M.iniciarPausa(b.dataset.pausa); return; }
    resp = {}; idx = 0; out.hidden = true; f.hidden = false; pintar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  M.alMostrar("puesto", () => { if (!f.hidden) pintar(); });
  pintar();
})(window.MPS);
