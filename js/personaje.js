/* personaje.js - personaje articulado en SVG que guía los ejercicios.
   Cada parte del cuerpo es un grupo (data-j) que gira desde su articulación (data-p).
   Un ejercicio es una secuencia de posturas; se enlazan con suavizado y se pueden sostener.
   Dos vistas: «frente» y «perfil» (mirando a la derecha). */
(function (M) {
  "use strict";

  /* ---------- dibujo: vista de frente (de pie; sentado se logra con la postura) ---------- */
  const brazoF = (l, x) => `
  <g data-j="brazo_${l}" data-p="${x},108">
    <line class="pj-piel-l" x1="${x}" y1="124" x2="${x}" y2="152" stroke-width="14"/>
    <line class="pj-ropa-l" x1="${x}" y1="110" x2="${x}" y2="130" stroke-width="20"/>
    <circle class="pj-ropa" cx="${x}" cy="111" r="11"/>
    <circle class="resalte z-hombro" cx="${x}" cy="112" r="14"/>
    <g data-j="ante_${l}" data-p="${x},152">
      <line class="pj-piel-l" x1="${x}" y1="152" x2="${x}" y2="190" stroke-width="13"/>
      <g data-j="mano_${l}" data-p="${x},191">
        <rect class="pj-piel" x="${x - 6.5}" y="186" width="13" height="20" rx="6.5"/>
        <circle class="resalte z-muneca" cx="${x}" cy="191" r="11"/>
      </g>
    </g>
  </g>`;
  const piernaF = (l, x) => `
  <g data-j="pierna_${l}" data-p="${x},172">
    <g data-j="rodilla_${l}" data-p="${x},224">
      <line class="pj-pantalon-l" x1="${x}" y1="224" x2="${x}" y2="266" stroke-width="19"/>
      <g data-j="pie_${l}" data-p="${x},270"><rect class="pj-zapato" x="${x - 12}" y="266" width="24" height="13" rx="6.5"/></g>
    </g>
    <g data-j="muslo_${l}" data-p="${x},172"><line class="pj-pantalon-l" x1="${x}" y1="172" x2="${x}" y2="224" stroke-width="22"/></g>
  </g>`;
  const FRENTE = `
  <g data-j="silla" class="pj-silla">
    <rect x="84" y="118" width="72" height="100" rx="16"/>
    <rect x="76" y="212" width="88" height="12" rx="6"/>
    <rect x="116" y="224" width="8" height="44" rx="3"/>
    <line class="pj-silla-l" x1="86" y1="272" x2="154" y2="272"/>
    <circle cx="86" cy="279" r="5"/><circle cx="154" cy="279" r="5"/><circle cx="120" cy="281" r="5"/>
  </g>
  <g data-j="cuerpo" data-p="120,280">
    ${piernaF("i", 106)}${piernaF("d", 134)}
    <rect class="pj-pantalon" x="92" y="160" width="56" height="26" rx="12"/>
    <g data-j="tronco" data-p="120,176">
      <g data-j="pecho" data-p="120,176">
        <path class="pj-ropa" d="M90,104 Q90,95 102,94 L138,94 Q150,95 150,104 L147,170 Q147,180 137,180 L103,180 Q93,180 93,170 Z"/>
        <path class="pj-piel-osc" d="M109,94 L120,110 L131,94 Z"/>
        <rect class="pj-ropa-osc" x="127" y="122" width="13" height="11" rx="2.5"/>
        <circle class="resalte z-lumbar" cx="120" cy="162" r="18"/>
      </g>
      <rect class="pj-piel-osc" x="111" y="80" width="18" height="20" rx="6"/>
      <circle class="resalte z-cuello" cx="120" cy="90" r="15"/>
      <g data-j="cabeza" data-p="120,96"><g transform="translate(0 3) translate(120 85) scale(.86) translate(-120 -85)">
        <g data-j="oreja_i" data-p="97,60"><ellipse class="pj-piel-osc" cx="94" cy="60" rx="5.5" ry="7.5"/></g>
        <g data-j="oreja_d" data-p="143,60"><ellipse class="pj-piel-osc" cx="146" cy="60" rx="5.5" ry="7.5"/></g>
        <ellipse class="pj-piel" cx="120" cy="56" rx="26" ry="29"/>
        <g data-j="cara" data-p="120,60">
          <circle class="pj-mejilla" cx="105" cy="68" r="4.5"/><circle class="pj-mejilla" cx="135" cy="68" r="4.5"/>
          <path class="pj-ceja" d="M104,49 q5,-3 10,-1"/><path class="pj-ceja" d="M126,48 q5,-2 10,1"/>
          <g data-j="ojos" data-p="120,58"><ellipse class="pj-ojo" cx="110" cy="58" rx="2.8" ry="3.6"/><ellipse class="pj-ojo" cx="130" cy="58" rx="2.8" ry="3.6"/></g>
          <path class="pj-nariz" d="M120,61 q-3,6 1,7"/>
          <path class="pj-boca" d="M112,74 q8,6 16,0"/>
        </g>
        <path class="pj-pelo" d="M93,58 C88,30 106,20 122,22 C140,22 152,34 148,58 C146,46 140,40 132,38 C124,44 108,44 100,40 C96,44 94,50 93,58 Z"/>
      </g></g>
      <g data-j="hombros" data-p="120,108">${brazoF("i", 88)}${brazoF("d", 152)}</g>
    </g>
  </g>`;

  /* ---------- dibujo: vista de perfil (mirando a la derecha) ---------- */
  const brazoP = (l, lejos) => `
  <g data-j="brazo_${l}" data-p="122,108"${lejos ? ' class="lejos"' : ""}>
    <line class="pj-piel-l" x1="122" y1="124" x2="122" y2="152" stroke-width="13"/>
    <line class="pj-ropa-l" x1="122" y1="110" x2="122" y2="130" stroke-width="18"/>
    <circle class="pj-ropa" cx="122" cy="111" r="10"/>
    ${lejos ? "" : '<circle class="resalte z-hombro" cx="122" cy="112" r="13"/>'}
    <g data-j="ante_${l}" data-p="122,152">
      <line class="pj-piel-l" x1="122" y1="152" x2="122" y2="190" stroke-width="12"/>
      <g data-j="mano_${l}" data-p="122,191">
        <rect class="pj-piel" x="116" y="187" width="12" height="21" rx="6"/>
        ${lejos ? "" : '<circle class="resalte z-muneca" cx="122" cy="193" r="12"/>'}
      </g>
    </g>
  </g>`;
  const piernaP = (l, lejos) => `
  <g data-j="pierna_${l}" data-p="120,172"${lejos ? ' class="lejos"' : ""}>
    <line class="pj-pantalon-l" x1="120" y1="172" x2="120" y2="224" stroke-width="22"/>
    <g data-j="rodilla_${l}" data-p="120,224">
      <line class="pj-pantalon-l" x1="120" y1="224" x2="120" y2="266" stroke-width="19"/>
      <g data-j="pie_${l}" data-p="120,270"><path class="pj-zapato" d="M110,264 h14 q16,2 18,12 v2 q0,4 -4,4 h-28 q-4,0 -4,-4 v-6 q0,-8 4,-8 z"/></g>
    </g>
  </g>`;
  const PERFIL = `
  <g data-j="silla" class="pj-silla">
    <rect x="84" y="138" width="14" height="98" rx="7"/>
    <rect x="86" y="232" width="82" height="11" rx="5.5"/>
    <rect x="124" y="243" width="8" height="26" rx="3"/>
    <line class="pj-silla-l" x1="94" y1="272" x2="162" y2="272"/>
    <circle cx="94" cy="279" r="5"/><circle cx="162" cy="279" r="5"/>
  </g>
  <g data-j="cuerpo" data-p="120,280">
    ${piernaP("l", true)}${piernaP("c", false)}
    <rect class="pj-pantalon" x="102" y="158" width="38" height="26" rx="12"/>
    <g data-j="tronco" data-p="120,176">
      ${brazoP("l", true)}
      <g data-j="pecho" data-p="120,176">
        <path class="pj-ropa" d="M108,98 Q100,100 101,114 L103,172 Q104,182 114,182 L130,182 Q140,182 140,172 L142,116 Q143,100 132,97 Z"/>
        <circle class="resalte z-lumbar" cx="106" cy="160" r="16"/>
      </g>
      <rect class="pj-piel-osc" x="114" y="80" width="16" height="22" rx="6"/>
      <circle class="resalte z-cuello" cx="122" cy="88" r="15"/>
      <g data-j="cabeza" data-p="122,98"><g transform="translate(0 3) translate(124 84) scale(.86) translate(-124 -84)">
        <ellipse class="pj-piel" cx="124" cy="56" rx="25" ry="28"/>
        <path class="pj-piel" d="M146,49 q10,8 2,15 z"/>
        <circle class="pj-mejilla" cx="137" cy="67" r="4"/>
        <path class="pj-ceja" d="M133,47 q5,-3 10,0"/>
        <g data-j="ojos" data-p="138,56"><ellipse class="pj-ojo" cx="138" cy="56" rx="2.5" ry="3.4"/></g>
        <path class="pj-boca" d="M139,74 q5,3 9,-1"/>
        <path class="pj-pelo" d="M100,60 C96,34 112,25 128,27 C142,28 150,37 148,47 C139,42 127,42 119,47 C114,51 112,57 111,64 C106,66 101,65 100,60 Z"/>
        <ellipse class="pj-piel-osc" cx="117" cy="61" rx="5" ry="7"/>
      </g></g>
      ${brazoP("c", false)}
    </g>
  </g>`;

  /* ---------- posturas base ---------- */
  const BASE = {
    frente: {
      cuerpo: { y: 40 }, muslo_i: { sy: .3 }, muslo_d: { sy: .3 }, rodilla_i: { y: -36.4 }, rodilla_d: { y: -36.4 },
      pierna_i: { r: 4 }, pierna_d: { r: -4 },
      brazo_i: { r: 10 }, ante_i: { r: -42 }, mano_i: { r: -10 },
      brazo_d: { r: -10 }, ante_d: { r: 42 }, mano_d: { r: 10 }
    },
    perfil: {
      cuerpo: { y: 52 }, pierna_c: { r: -90 }, rodilla_c: { r: 90 }, pierna_l: { r: -86, x: -3 }, rodilla_l: { r: 86 },
      brazo_c: { r: -12 }, ante_c: { r: -68 }, mano_c: { r: -10 },
      brazo_l: { r: -6 }, ante_l: { r: -72 }, mano_l: { r: -10 }
    },
    /* de pie, de perfil: la silla se desvanece */
    perfilPie: {
      silla: { o: 0 }, pierna_l: { x: -3 },
      brazo_c: { r: -4 }, ante_c: { r: -10 }, brazo_l: { r: -2, x: -2 }, ante_l: { r: -8 }
    }
  };

  /* ---------- ejercicios: [cambios sobre la base, ms de transición, ms sostenido] ----------
     vista: frente | perfil · base: postura de partida (por defecto la de la vista) · extra: cambios fijos
     inicio: cuadros que se hacen una sola vez, como [base, cambios, ms, ms] (por ejemplo, ponerse de pie) */
  const CERRADOS = { ojos: { sy: .12 } };
  /* frente */
  const MANOS_ARRIBA = { brazo_i: { r: 14 }, ante_i: { r: -150 }, mano_i: { r: 0 }, brazo_d: { r: -14 }, ante_d: { r: 150 }, mano_d: { r: 0 } };
  const ABIERTAS = { ...MANOS_ARRIBA, mano_i: { sx: 1.45, sy: 1.2 }, mano_d: { sx: 1.45, sy: 1.2 } };
  const PUNOS = { ...MANOS_ARRIBA, mano_i: { sx: .95, sy: .6 }, mano_d: { sx: .95, sy: .6 } };
  const COLGADOS = { brazo_i: { r: 14 }, ante_i: { r: 0 }, mano_i: { r: 0 }, brazo_d: { r: -14 }, ante_d: { r: 0 }, mano_d: { r: 0 } };
  const SACUDE_A = { ...COLGADOS, ante_i: { r: 6 }, mano_i: { r: 20 }, ante_d: { r: -6 }, mano_d: { r: -20 } };
  const SACUDE_B = { ...COLGADOS, ante_i: { r: -6 }, mano_i: { r: -20 }, ante_d: { r: 6 }, mano_d: { r: 20 } };
  const FROTA_A = { brazo_i: { r: 20 }, ante_i: { r: -123 }, mano_i: { r: 0 }, brazo_d: { r: -20 }, ante_d: { r: 123 }, mano_d: { r: 0 } };
  const FROTA_B = { ...FROTA_A, ante_i: { r: -129 }, ante_d: { r: 117 } };
  const PALMEO = { brazo_i: { r: 139 }, ante_i: { r: 118 }, mano_i: { r: 0 }, brazo_d: { r: -139 }, ante_d: { r: -118 }, mano_d: { r: 0 }, ...CERRADOS };
  /* perfil */
  const MUNECA_EXT = { brazo_c: { r: -90 }, ante_c: { r: 0 }, mano_c: { r: -12 } };
  const MUNECA_ARR = { brazo_c: { r: -90 }, ante_c: { r: 0 }, mano_c: { r: 8 } };
  const CINTURA = { brazo_c: { r: 35 }, ante_c: { r: -90 }, mano_c: { r: -20 }, brazo_l: { r: 30, x: -2 }, ante_l: { r: -86 }, mano_l: { r: -20 } };
  const MARCHA_A = { pierna_c: { r: -55 }, rodilla_c: { r: 70 }, brazo_c: { r: 22 }, ante_c: { r: -20 }, brazo_l: { r: -28, x: -2 }, ante_l: { r: -40 } };
  const MARCHA_B = { pierna_l: { r: -55, x: -3 }, rodilla_l: { r: 70 }, brazo_l: { r: 22, x: -2 }, ante_l: { r: -20 }, brazo_c: { r: -28 }, ante_c: { r: -40 } };
  const PIE_ARRIBA = { pierna_c: { r: -28 }, rodilla_c: { r: 16 } };
  const PARARSE = [["perfil", {}, 0, 500], ["perfilPie", {}, 1600, 300]];

  const A = {
    reposo: { vista: "frente", cuadros: [[{}, 0, 600], [{ pecho: { sx: 1.03, sy: 1.025 }, hombros: { y: -2 } }, 1800, 400], [{}, 1800, 400]] },

    /* ---- frente ---- */
    breathe: {
      vista: "frente",
      cuadros: [[{}, 0, 300], [{ pecho: { sx: 1.05, sy: 1.04 }, hombros: { y: -4 }, cabeza: { y: -3 }, ...CERRADOS }, 4000, 2000], [CERRADOS, 6000, 500]]
    },
    tilt: {
      vista: "frente", zona: "cuello",
      flechas: ["M88,86 Q76,104 88,122", "M152,86 Q164,104 152,122"],
      cuadros: [[{}, 0, 500],
        [{ cabeza: { r: -24 }, ...CERRADOS }, 1700, 2200], [{}, 1300, 500],
        [{ cabeza: { r: 24 }, ...CERRADOS }, 1700, 2200], [{}, 1300, 500]]
    },
    turn: {
      vista: "frente", zona: "cuello",
      flechas: ["M110,70 Q98,68 90,78", "M130,70 Q142,68 150,78"],
      cuadros: [[{}, 0, 500],
        [{ cara: { x: -8 }, oreja_i: { sx: .2 }, oreja_d: { sx: 1.15 }, cabeza: { r: -3 } }, 1500, 1800], [{}, 1300, 400],
        [{ cara: { x: 8 }, oreja_d: { sx: .2 }, oreja_i: { sx: 1.15 }, cabeza: { r: 3 } }, 1500, 1800], [{}, 1300, 400]]
    },
    shoulders: {
      vista: "frente", zona: "hombro",
      flechas: ["M74,152 Q70,130 92,124", "M166,152 Q170,130 148,124"],
      cuadros: [[{}, 0, 200], [{ hombros: { y: -11 } }, 700, 150], [{ hombros: { y: -5, sx: .95 } }, 450, 0], [{ hombros: { y: 2 } }, 550, 100], [{}, 450, 100]]
    },
    hands: {
      vista: "frente", zona: "muneca",
      cuadros: [[{}, 0, 300], [ABIERTAS, 900, 400], [PUNOS, 350, 450], [ABIERTAS, 350, 450], [PUNOS, 350, 450], [ABIERTAS, 350, 450], [{}, 900, 300]]
    },
    shake: {
      vista: "frente",
      cuadros: [[{}, 0, 200], [COLGADOS, 600, 100],
        [SACUDE_A, 150, 0], [SACUDE_B, 150, 0], [SACUDE_A, 150, 0], [SACUDE_B, 150, 0], [SACUDE_A, 150, 0], [SACUDE_B, 150, 0],
        [COLGADOS, 150, 300], [{}, 700, 300]]
    },
    eyes: {
      vista: "frente",
      flechas: ["M150,96 Q178,78 206,70"],
      cuadros: [[{}, 0, 500], [{ ojos: { x: 3, y: -2 }, cara: { x: 4 }, cabeza: { r: 3 } }, 1200, 3500], [{}, 1000, 800]]
    },
    blink: {
      vista: "frente",
      cuadros: [[{}, 0, 500], [CERRADOS, 300, 600], [{}, 300, 600], [CERRADOS, 300, 600], [{}, 300, 900]]
    },
    palm: {
      vista: "frente",
      cuadros: [[{}, 0, 300], [FROTA_A, 900, 0], [FROTA_B, 250, 0], [FROTA_A, 250, 0], [FROTA_B, 250, 0], [FROTA_A, 250, 0],
        [PALMEO, 1000, 4000], [{}, 1200, 400]]
    },
    twist: {
      vista: "frente", zona: "lumbar",
      flechas: ["M94,200 Q120,214 148,200"],
      cuadros: [[{}, 0, 400],
        [{ tronco: { sx: .86 }, cara: { x: 8 }, oreja_d: { sx: .2 }, brazo_i: { r: -28 }, ante_i: { r: -30 }, brazo_d: { r: -32 }, ante_d: { r: 10 } }, 1800, 3000],
        [{}, 1500, 500]]
    },

    /* ---- perfil ---- */
    chin: {
      vista: "perfil", zona: "cuello",
      flechas: ["M164,100 Q180,120 160,142"],
      cuadros: [[{}, 0, 600], [{ cabeza: { r: 28 }, ...CERRADOS }, 1900, 2600], [{}, 1500, 700]]
    },
    tuck: {
      vista: "perfil", zona: "cuello",
      flechas: ["M196,110 L156,110"],
      cuadros: [[{}, 0, 500], [{ cabeza: { x: -8, r: -4 } }, 900, 2000], [{}, 800, 700]]
    },
    flex: {
      vista: "perfil", zona: "lumbar",
      flechas: ["M170,150 Q190,178 172,206"],
      cuadros: [[{}, 0, 400],
        [{ tronco: { r: 35 }, brazo_c: { r: -35 }, ante_c: { r: 0 }, mano_c: { r: 0 }, brazo_l: { r: -35 }, ante_l: { r: 0 }, mano_l: { r: 0 }, cabeza: { r: 10 }, ...CERRADOS }, 2000, 2500],
        [{}, 2500, 600]]
    },
    wrist: {
      vista: "perfil", zona: "muneca",
      flechas: ["M232,148 Q244,166 228,186"],
      cuadros: [[{}, 0, 500], [MUNECA_EXT, 1400, 300],
        [{ ...MUNECA_EXT, mano_c: { r: 62 }, brazo_l: { r: -78 }, ante_l: { r: -2 }, mano_l: { r: 18 } }, 1300, 2600],
        [MUNECA_EXT, 1000, 300], [{}, 1400, 700]]
    },
    wrist2: {
      vista: "perfil", zona: "muneca",
      flechas: ["M232,180 Q246,162 232,140"],
      cuadros: [[{}, 0, 500], [MUNECA_ARR, 1400, 300],
        [{ ...MUNECA_ARR, mano_c: { r: -62 }, brazo_l: { r: -101 }, ante_l: { r: -2 }, mano_l: { r: -15 } }, 1300, 2600],
        [MUNECA_ARR, 1000, 300], [{}, 1400, 700]]
    },
    march: {
      vista: "perfil", base: "perfilPie", inicio: PARARSE,
      cuadros: [[{}, 0, 100], [MARCHA_A, 450, 60], [{}, 350, 0], [MARCHA_B, 450, 60], [{}, 350, 0]]
    },
    extend: {
      vista: "perfil", base: "perfilPie", extra: CINTURA, zona: "lumbar",
      flechas: ["M116,42 Q98,40 88,54"],
      cuadros: [[{}, 0, 500], [{ tronco: { r: -13 }, cabeza: { r: -4 } }, 1500, 1500], [{}, 1300, 600]]
    },
    tiptoe: {
      vista: "perfil", base: "perfilPie",
      flechas: ["M100,278 L100,250"],
      cuadros: [[{}, 0, 400], [{ cuerpo: { y: -10 }, pie_c: { r: 25 }, pie_l: { r: 25 } }, 1000, 800], [{}, 1000, 400]]
    },
    ankle: {
      vista: "perfil", base: "perfilPie",
      cuadros: [[{}, 0, 300], [PIE_ARRIBA, 600, 200],
        [{ ...PIE_ARRIBA, pie_c: { r: -28 } }, 500, 0], [{ ...PIE_ARRIBA, pie_c: { r: 22 } }, 500, 0],
        [{ ...PIE_ARRIBA, pie_c: { r: -28 } }, 500, 0], [{ ...PIE_ARRIBA, pie_c: { r: 22 } }, 500, 0],
        [PIE_ARRIBA, 400, 200], [{}, 600, 300]]
    }
  };

  /* ---------- motor ---------- */
  const DEF = { x: 0, y: 0, r: 0, sx: 1, sy: 1, o: 1 };
  /* suavizado: mezcla de curva en S y línea recta, para que arranque y frene sin sentirse mecánico */
  const suave = t => 0.6 * (-(Math.cos(Math.PI * t) - 1) / 2) + 0.4 * t;
  /* velocidad general (la respiración guiada va a su ritmo, atada a la voz) */
  const VEL = 1.45;
  /* las partes de las puntas siguen un poco después que el resto (inercia) */
  const RETRASO = { cabeza: 90, cara: 90, ojos: 90, oreja_i: 90, oreja_d: 90, ante_i: 80, ante_d: 80, mano_i: 150, mano_d: 150, rodilla_i: 60, rodilla_d: 60, pie_i: 110, pie_d: 110 };
  const reducir = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let contador = 0;

  function mezclar(base, cambios) { return Object.assign({}, base, cambios); }
  function interp(a, b, t, juntas) {
    const p = {};
    juntas.forEach(j => {
      const va = { ...DEF, ...a[j] }, vb = { ...DEF, ...b[j] }, v = {};
      for (const k in DEF) v[k] = va[k] + (vb[k] - va[k]) * t;
      p[j] = v;
    });
    return p;
  }
  function aplicar(nodos, pose, juntas) {
    juntas.forEach(j => {
      const n = nodos[j]; if (!n) return;
      const v = { ...DEF, ...pose[j] }, [px, py] = n.p;
      if (j === "silla") { n.g.style.opacity = v.o.toFixed(3); return; }
      let tr = `translate(${v.x.toFixed(2)} ${v.y.toFixed(2)}) rotate(${v.r.toFixed(2)} ${px} ${py})`;
      if (v.sx !== 1 || v.sy !== 1) tr += ` translate(${px} ${py}) scale(${v.sx.toFixed(3)} ${v.sy.toFixed(3)}) translate(${-px} ${-py})`;
      n.g.setAttribute("transform", tr);
    });
  }
  function poseEn(cuadros, t, sinVuelta) {
    const n = cuadros.length; let acc = 0;
    for (let k = 0; k < n; k++) {
      const [pk, d, h] = cuadros[k], prev = cuadros[sinVuelta ? Math.max(k - 1, 0) : (k - 1 + n) % n][0];
      if (d > 0 && t < acc + d) return [prev, pk, suave((t - acc) / d)];
      acc += d;
      if (t < acc + h) return [pk, pk, 0];
      acc += h;
    }
    return [cuadros[n - 1][0], cuadros[n - 1][0], 0];
  }

  const activos = new Set(); let raf = 0;
  function bucle(now) {
    activos.forEach(p => { if (!p.svg.isConnected) activos.delete(p); else if (!p.pausado) p.dibujar(now); });
    raf = activos.size ? requestAnimationFrame(bucle) : 0;
  }

  function construir(a, opts) {
    const id = "pjf" + (++contador);
    const flechas = !opts.mini && a.flechas ? a.flechas.map(d => `<path class="pj-flecha" d="${d}" marker-end="url(#${id})"/>`).join("") : "";
    return `<svg class="pj" viewBox="0 0 240 300" role="img" aria-label="Personaje que muestra el ejercicio"${a.zona && !opts.mini ? ` data-zona="${a.zona}"` : ""}>
      <defs><marker id="${id}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path class="pj-punta" d="M0,0 L10,5 L0,10 z"/></marker></defs>
      <ellipse class="pj-sombra" cx="120" cy="288" rx="78" ry="7"/>
      ${a.vista === "perfil" ? PERFIL : FRENTE}${flechas}</svg>`;
  }

  M.Personaje = {
    /* monta el personaje en «el» con la animación del ejercicio; devuelve un control */
    montar(el, anim, opts = {}) {
      const a = A[anim] || A.reposo;
      el.innerHTML = construir(a, opts);
      const svg = el.firstElementChild, nodos = {};
      svg.querySelectorAll("[data-j]").forEach(g => { nodos[g.dataset.j] = { g, p: (g.dataset.p || "0,0").split(",").map(Number) }; });
      const base = mezclar(BASE[a.base || a.vista], a.extra || {});
      const cuadros = a.cuadros.map(([c, d, h]) => [mezclar(base, c), d, h]);
      const inicio = (a.inicio || []).map(([b, c, d, h]) => [mezclar(BASE[b], c), d, h]);
      const juntas = [...new Set([...inicio, ...cuadros].flatMap(c => Object.keys(c[0])))];
      ["ojos", "silla", "cuerpo", "pecho", "hombros", "cabeza"].forEach(j => { if (nodos[j] && !juntas.includes(j)) juntas.push(j); });
      const vel = a === A.breathe ? 1 : VEL;
      const ciclo = cuadros.reduce((s, c) => s + c[1] + c[2], 0);
      const previo = inicio.reduce((s, c) => s + c[1] + c[2], 0);
      let parpadeo = performance.now() + 2500;

      const inst = {
        svg, pausado: false, t0: performance.now(), pausaEn: 0,
        dibujar(now) {
          const e = Math.max(0, now - this.t0) * vel;
          const en = x => { const q = Math.max(0, x); const [pa, pb, t] = q < previo ? poseEn(inicio, q, true) : poseEn(cuadros, (q - previo) % ciclo); return interp(pa, pb, t, juntas); };
          const pose = en(e), tarde = {};
          juntas.forEach(j => { const r = RETRASO[j]; if (r) { tarde[r] = tarde[r] || en(e - r); pose[j] = tarde[r][j]; } });
          /* vida en reposo: respiración y balanceo muy leves, también mientras sostiene una postura */
          if (nodos.pecho) { const v = { ...DEF, ...pose.pecho }, k = Math.sin(now / 640); v.sx *= 1 + 0.012 * k; v.sy *= 1 + 0.016 * k; pose.pecho = v; }
          if (nodos.hombros) { const v = { ...DEF, ...pose.hombros }; v.y += 0.8 * Math.sin(now / 640 + 0.4); pose.hombros = v; }
          if (nodos.cuerpo) { const v = { ...DEF, ...pose.cuerpo }; v.r += 0.35 * Math.sin(now / 1350); pose.cuerpo = v; }
          if (nodos.cabeza) { const v = { ...DEF, ...pose.cabeza }; v.r += 0.6 * Math.sin(now / 1700 + 1); pose.cabeza = v; }
          if (now > parpadeo) { pose.ojos = { ...DEF, ...pose.ojos }; pose.ojos.sy *= .1; if (now > parpadeo + 140) parpadeo = now + 2500 + Math.random() * 3000; }
          aplicar(nodos, pose, juntas);
        },
        pausar() { if (!this.pausado) { this.pausado = true; this.pausaEn = performance.now(); } },
        reanudar() { if (this.pausado) { this.t0 += performance.now() - this.pausaEn; this.pausado = false; } },
        detener() { activos.delete(this); }
      };

      if (opts.estatico || reducir()) { const k = cuadros[opts.cuadro != null ? opts.cuadro : Math.min(1, cuadros.length - 1)][0]; aplicar(nodos, interp(k, k, 0, juntas), juntas); return inst; }
      aplicar(nodos, interp(cuadros[0][0], cuadros[0][0], 0, juntas), juntas);
      activos.add(inst);
      if (!raf) raf = requestAnimationFrame(bucle);
      return inst;
    },
    tiene: anim => anim in A
  };
})(window.MPS);
