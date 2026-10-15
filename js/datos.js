/* datos.js - datos del estudio, configuración y almacenamiento local.
   Los valores de línea base salen del estudio 2026 (n = 57). No cambiarlos sin soporte. */
window.MPS = window.MPS || {};
(function (M) {
  "use strict";

  /* ---------- configuración ---------- */
  // Dirección donde está publicada la app (GitHub Pages). Vacía = se usa la dirección actual si es http(s).
  M.APP_URL = "https://yefer21pro.github.io/reset-corporal/";

  /* ---------- línea base 2026 ---------- */
  M.BASE = { cuello: 63.2, espalda_baja: 59.6, hombro: 43.9, muneca: 43.9, espalda_alta: 38.6 };
  M.TOTAL_EVALUADOS = 57;

  M.SEGS = [
    ["cuello", "Cuello"], ["hombro", "Hombros"], ["espalda_alta", "Espalda alta"],
    ["codo", "Codos"], ["muneca", "Muñecas / manos"], ["espalda_baja", "Espalda baja"],
    ["cadera", "Caderas / piernas"], ["rodilla", "Rodillas"], ["tobillo", "Tobillos / pies"]
  ];
  M.SEGNAME = Object.fromEntries(M.SEGS);
  /* qué rutina corresponde a cada zona con molestia (CONTEXTO.md, 5.3) */
  M.RUTINA_ZONA = { cuello: "cuello", hombro: "brazo", codo: "brazo", muneca: "brazo", espalda_baja: "lumbar", cadera: "piernas", rodilla: "piernas", tobillo: "piernas" };

  M.ELEM_DEF = {
    atril: ["Atril o portadocumentos", 8],
    base_monitor: ["Base para monitor", 5],
    forro: ["Forro acolchado para reposabrazos", 5],
    silla: ["Cambio de silla", 3],
    apoyapies: ["Apoyapiés", 2],
    base_portatil: ["Base para portátil", 2],
    teclado_raton: ["Teclado y ratón externos", 2]
  };

  /* ---------- módulo 1: preguntas basadas en ROSA ---------- */
  M.Q = [
    { id: "respaldo", t: "¿Su espalda se apoya completa en el respaldo, con soporte en la zona lumbar?", pts: 2, fix: "Siéntese al fondo de la silla y ajuste el respaldo a la curva de la cintura. Si no tiene apoyo lumbar, solicite un cojín lumbar a SST." },
    { id: "reposabrazos", t: "¿Sus codos descansan en los reposabrazos a la altura del escritorio, con los hombros relajados?", pts: 1, fix: "Baje o suba los reposabrazos hasta que los codos queden a 90° sin subir los hombros. Si están duros o no se ajustan, pida forros acolchados." },
    { id: "raton", t: "¿El ratón está al lado del teclado, sin estirar ni abrir el brazo?", pts: 1, fix: "Acerque el ratón al borde del teclado y apoye el antebrazo en la mesa." },
    { id: "pantalla", t: "¿El borde superior de la pantalla está a la altura de sus ojos y a un brazo de distancia?", pts: 1, fix: "Eleve la pantalla con una base o un soporte; aléjela hasta que llegue con la punta de los dedos." },
    { id: "pies", t: "¿Sus pies apoyan completos en el piso o en un apoyapiés, con las rodillas cerca de 90°?", pts: 1, fix: "Ajuste la altura de la silla. Si al bajarla queda lejos del escritorio, solicite un apoyapiés." },
    { id: "atril", t: "Cuando transcribe de papel, ¿usa un atril o portadocumentos junto a la pantalla?", pts: 1, na: true, fix: "Ubique el documento junto a la pantalla, a la misma altura, para no girar ni bajar el cuello." },
    { id: "tiempo", t: "¿Pasa más de 4 horas al día frente al computador?", pts: 1, inv: true, fix: "Haga una pausa activa cada hora (sección «Pausas activas»)." }
  ];

  /* ---------- módulo 2: rutinas ----------
     paso = [título, indicación, segundos, animación, (guía de respiración), (repeticiones)] */
  M.ROUT = [
    { id: "respira", name: "Respira conmigo", fact: "Para empezar el día", intro: "Vamos a respirar profundo cinco veces.", steps: [
      ["Acomódese", "Siéntese al fondo de la silla, apoye la espalda y suelte los hombros.", 12, "breathe"],
      ["Respiración profunda", "Inhale por la nariz, sostenga y exhale despacio por la boca.", 60, "breathe", [["Inhala", 4], ["Sostén", 2], ["Exhala despacio", 6]], 5],
      ["Cuello suave", "Mueva la cabeza despacio de lado a lado.", 16, "tilt"]] },
    { id: "cuello", name: "Cuello", fact: "Cuello: 63,2 % con molestias", intro: "Vamos a soltar el cuello.", steps: [
      ["Inclinación lateral", "Lleve la oreja hacia el hombro sin subirlo. Cambie de lado a la mitad.", 30, "tilt"],
      ["Mentón al pecho", "Baje el mentón suavemente y sienta la nuca.", 20, "chin"],
      ["Doble mentón", "Lleve la cabeza hacia atrás, sostenga dos segundos y suelte.", 30, "tuck"],
      ["Giros lentos", "Gire la cabeza a la derecha y a la izquierda, sin forzar.", 30, "turn"],
      ["Hombros abajo", "Inhale y deje caer los hombros al exhalar.", 20, "breathe"]] },
    { id: "lumbar", name: "Espalda baja", fact: "Espalda baja: 59,6 % con molestias", intro: "Vamos a mover la espalda baja.", steps: [
      ["Póngase de pie", "Levántese y marche en el sitio.", 30, "march"],
      ["Extensión suave", "Manos en la cintura, lleve el tronco un poco hacia atrás y vuelva.", 30, "extend"],
      ["Rotación sentado", "Gire el tronco a un lado con la mano en el respaldo. Cambie a la mitad.", 30, "twist"],
      ["Flexión sentado", "Incline el tronco hacia adelante y deje colgar los brazos. Suba despacio.", 20, "flex"],
      ["Siéntese bien", "Vuelva al fondo de la silla con la espalda apoyada.", 15, "breathe"]] },
    { id: "brazo", name: "Hombro y muñeca", fact: "Hombro y muñeca: 43,9 % cada uno", intro: "Vamos a cuidar hombros y muñecas.", steps: [
      ["Círculos de hombros", "Haga círculos amplios hacia atrás.", 20, "shoulders"],
      ["Muñeca hacia abajo", "Brazo al frente, palma arriba; lleve los dedos hacia abajo con la otra mano. Cambie a la mitad.", 30, "wrist"],
      ["Muñeca hacia arriba", "Brazo al frente, palma abajo; lleve la mano hacia usted. Cambie a la mitad.", 30, "wrist2"],
      ["Abrir y cerrar", "Abra los dedos al máximo y cierre el puño, varias veces.", 20, "hands"],
      ["Sacudir", "Deje caer los brazos y sacuda suavemente las manos.", 15, "shake"]] },
    { id: "ojos", name: "Ojos y pantalla", fact: "Regla 20-20-20", intro: "Vamos a descansar la vista de la pantalla.", steps: [
      ["Mire lejos", "Mire algo a más de seis metros, por una ventana o al fondo del pasillo.", 20, "eyes"],
      ["Parpadee", "Parpadee despacio varias veces para humedecer los ojos.", 15, "blink"],
      ["Palmeo", "Frote las manos y cubra los ojos cerrados sin presionar.", 25, "palm"],
      ["Mire lejos otra vez", "Enfoque de nuevo un punto lejano.", 20, "eyes"]] },
    { id: "piernas", name: "Piernas y circulación", fact: "Después de horas sentado", intro: "Vamos a activar la circulación de las piernas.", steps: [
      ["Marcha en el sitio", "De pie, levante las rodillas a buen ritmo.", 30, "march"],
      ["Puntas de pie", "Suba en puntas de pie y baje despacio.", 25, "tiptoe"],
      ["Círculos de tobillo", "Con un pie en el aire, dibuje círculos. Cambie a la mitad.", 30, "ankle"],
      ["Respire y vuelva", "Respire profundo y vuelva a su puesto.", 15, "breathe"]] }
  ];

  /* ---------- almacenamiento local (solo este equipo) ----------
     mps_evaluaciones y mps_reportes: listas de registros con el código del trabajador.
     Nunca se guarda el nombre junto con los registros. */
  const MAX_REG = 2000;
  M.ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  };
  function leerLista(col) {
    try { const v = JSON.parse(M.ls.get("mps_" + col) || "[]"); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  M.leer = leerLista;
  M.guardar = function (col, rec) {
    const lista = leerLista(col);
    lista.push(rec);
    const ok = M.ls.set("mps_" + col, JSON.stringify(lista.slice(-MAX_REG)));
    return ok ? "Guardado en este equipo con el código " + rec.codigo + "."
              : "No se pudo guardar: el navegador no permite guardar datos en este equipo.";
  };
  /* elementos de apoyo que el propio trabajador marca: { clave: "necesito" | "recibido" | "no" } */
  M.leerElementos = function () {
    try { return JSON.parse(M.ls.get("mps_elementosPersonal") || "{}") || {}; } catch (e) { return {}; }
  };
  M.guardarElementos = function (items) { M.ls.set("mps_elementosPersonal", JSON.stringify(items)); };

  /* ---------- descargas ---------- */
  M.descargar = function (nombre, contenido, tipo) {
    const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    const a = document.createElement("a");
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /* CSV con punto y coma y BOM para que Excel en español lo abra bien */
  M.csv = function (encabezados, filas) {
    const c = v => { const s = v == null ? "" : String(v); return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return "﻿" + [encabezados, ...filas].map(f => f.map(c).join(";")).join("\r\n");
  };
})(window.MPS);
