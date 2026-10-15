/* humor.js - el lado simpático de la app: frases del personaje, mensajes al terminar, chiste del día,
   saludos con gracia e insignias personales.
   Reglas: humor limpio sobre la oficina, la silla y las costumbres de trabajo; nunca sobre el dolor, la
   enfermedad, los pacientes ni el cuerpo de nadie. Con dolor fuerte reportado la app se pone seria sola.
   Las frases las debe revisar el asesor antes de la sustentación. */
(function (M) {
  "use strict";
  const { $, $$ } = M;

  /* ---------- tono: serio (0), cercano (1) o divertido (2) ---------- */
  const TONOS = { serio: 0, cercano: 1, divertido: 2 };
  M.tono = () => { const t = M.ls.get("mps_tono"); return Object.prototype.hasOwnProperty.call(TONOS, t) ? t : "divertido"; };

  /* dolor fuerte reportado en los últimos 7 días: ahí no hay bromas */
  function dolorFuerte() {
    const cod = M.perfil().codigo; if (!cod) return false;
    const r = M.leer("reportes").filter(x => x.codigo === cod).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    return !!r && Date.now() - Date.parse(r.fecha) < 7 * 864e5 && (r.impide || r.maxInt >= 7);
  }
  M.humor = () => dolorFuerte() ? 0 : TONOS[M.tono()];

  /* elige una frase sin repetir la anterior */
  const ultimo = {};
  const elegir = (lista, clave) => {
    let k; do { k = Math.floor(Math.random() * lista.length); } while (lista.length > 1 && k === ultimo[clave]);
    ultimo[clave] = k; return lista[k];
  };
  const delDia = lista => { const h = new Date(), n = Math.floor((h - new Date(h.getFullYear(), 0, 0)) / 864e5); return lista[n % lista.length]; };

  /* ---------- 1. frases del personaje durante la pausa ---------- */
  const GLOBOS = {
    respira: [
      "Inhale, exhale. Su correo puede esperar tres respiraciones.",
      "Respirar es gratis y no necesita autorización del jefe.",
      "Si el aire entra y sale, vamos muy bien.",
      "Hasta el computador se reinicia. Usted también merece un respiro.",
      "Hombros abajo. Los hombros no son aretes.",
      "Con calma. Nadie le está cobrando el aire."
    ],
    cuello: [
      "Su cuello lleva horas mirando la pantalla. Merece vacaciones de diez segundos.",
      "Despacio. El cuello no es de los que van a toda velocidad.",
      "La cabeza pesa unos cinco kilos. Su cuello la carga gratis todo el día. Agradézcale.",
      "Oreja al hombro, sin trampa. Nadie le pone nota, pero lo vemos.",
      "Esto no es un baile, pero el cuello igual lo agradece.",
      "Gire con calma. Nadie lo viene siguiendo."
    ],
    lumbar: [
      "Párese, que la silla también necesita descansar de usted.",
      "Su silla le tiene cariño, pero no para tenerlo ocho horas seguidas.",
      "Estire. La espalda no es una tabla de planchar.",
      "Marche en el sitio. Se permite hacerlo con cara de seriedad.",
      "Una espalda feliz es una espalda que se mueve.",
      "Si alguien lo ve estirándose, invítelo. Las pausas se contagian."
    ],
    brazo: [
      "Esas manos teclean todo el día. Se merecen un aplauso.",
      "Abrir y cerrar. Sí, parece que saluda a nadie. Siga igual.",
      "Sacuda las manos. Hasta ellas necesitan soltar el estrés.",
      "Círculos amplios con los hombros. Va camino a nadador de escritorio.",
      "El ratón no se va a ir. Suelte la mano un momento.",
      "Su teclado lo extrañará cinco segundos. Va a sobrevivir."
    ],
    ojos: [
      "Mire lejos. Las paredes también tienen ventana, aunque sea imaginaria.",
      "La pantalla no se va a ir. Los ojos sí necesitan descanso.",
      "Parpadee. Es gratis y viene incluido de fábrica.",
      "Regla 20-20-20: cada veinte minutos, veinte segundos, a seis metros.",
      "Parpadear no es perder tiempo: es hidratar los ojos.",
      "Frote las manos. Calorcito para los ojos, sin pasar por la cafetería."
    ],
    piernas: [
      "Esas piernas no están de adorno. Hoy toca levantarlas.",
      "Marche. Nadie lo cronometra, pero la circulación sí lo nota.",
      "Puntas de pie: por unos segundos, usted es el más alto de la oficina.",
      "Los tobillos también existen. Salúdelos.",
      "Su silla no se va a ir a ninguna parte. Usted sí: a caminar un ratico.",
      "Cada paso cuenta. Y el cafecito de después, también."
    ]
  };
  let usadas = new Set();
  M.reiniciarFrases = () => { usadas = new Set(); };
  M.fraseGlobo = rutina => {
    const lista = (GLOBOS[rutina] || []).filter(f => !usadas.has(f));
    if (!lista.length) return "";
    const f = elegir(lista, "globo-" + rutina); usadas.add(f); return f;
  };

  /* ---------- 2. mensaje al terminar la pausa ---------- */
  const FINALES = [
    "Misión cumplida. Su espalda ya le escribió una carta de agradecimiento.",
    "Pausa lista. El correo seguirá ahí, pero usted ya está mejor.",
    "Muy bien. Su cuello dice que usted es su persona favorita de la oficina.",
    "Listo. Hoy le ganó a la silla.",
    "Aplausos para usted. La postura es cosa seria, pero esto fue divertido.",
    "Pausa completada. Su yo del futuro se lo va a agradecer.",
    "Otra pausa al bolsillo. Siga la racha.",
    "Hecho. Ahora sí, a seguir con lo que estaba, pero con mejor cara."
  ];
  M.mensajeFinal = () => elegir(FINALES, "final");

  /* ---------- 3. chiste del día (cambia cada día, no en cada recarga) ---------- */
  const CHISTES = [
    "¿Sabía que la silla no se ofende si la ajusta? Hágalo con confianza.",
    "El ratón no es un animal en peligro de extinción: puede acercarlo al teclado.",
    "Pantalla a la altura de los ojos. Su cuello no es una jirafa.",
    "Pregunta de oficina: ¿cuántas pestañas tiene abiertas? Y su cuerpo, ¿cuántas pausas?",
    "Una pausa de tres minutos cabe hasta en la reunión que pudo ser un correo.",
    "El café se enfría. La espalda también, si no se mueve.",
    "Lo único que debería estar encorvado en la oficina es el clip.",
    "Apoye los pies. El piso lleva años esperando que alguien lo visite.",
    "Su silla tiene respaldo. Úselo: para eso no le cobraron extra.",
    "Mirar por la ventana no es distracción: es la regla 20-20-20 en acción.",
    "Su computador se reinicia cuando se traba. Haga lo mismo: levántese.",
    "Dato curioso: la cabeza pesa unos cinco kilos. Su cuello la carga gratis todos los días.",
    "Si el teclado hablara, pediría que apoye bien las muñecas.",
    "Postura ideal de oficina: erguida, relajada y con cara de que la reunión terminó.",
    "Ctrl + Alt + Suprimir no arregla la espalda. Una pausa sí.",
    "Los mejores ascensos del día: subir y bajar de la silla cada hora.",
    "Los hombros no son aretes. Bájelos.",
    "Cuello, hombros y muñecas: el trío de la oficina que hoy pide descanso.",
    "Un estiramiento a tiempo ahorra tres suspiros y media queja.",
    "Hoy el mejor atajo del teclado es levantarse de la silla."
  ];
  M.chisteDelDia = () => delDia(CHISTES);

  /* ---------- 4. saludo con humor según el día y la hora ---------- */
  const SEMANA = [
    "Domingo trabajando. Con más razón, una pausa para usted.",
    "Lunes: arranque suave, que la espalda todavía va en piyama.",
    "Martes. Ya nadie se acuerda del lunes. Su cuello sí.",
    "Miércoles: mitad de semana, momento perfecto para estirarse.",
    "Jueves. Falta poco, pero las pausas no se saltan.",
    "Viernes. Ya casi. La espalda todavía no se entera.",
    "Sábado de trabajo. Respeto máximo y pausas obligatorias."
  ];
  M.bromaSaludo = () => {
    const h = new Date().getHours();
    if (h < 7) return "Madrugador. Avísele a su cuello, que también madrugó.";
    if (h >= 12 && h < 14) return "Hora de almuerzo: levántese de la silla antes de sentarse a comer.";
    if (h >= 17) return "Ya casi sale. Una última pausa y se va con la espalda feliz.";
    return SEMANA[new Date().getDay()];
  };

  /* ---------- 5. insignias personales (se calculan con el historial de este equipo) ---------- */
  const RUTINAS = [
    ["cuello", "Cuello de seda", "Cuello: 5 pausas", "Haga 5 pausas de cuello."],
    ["lumbar", "Espalda de bambú", "Espalda baja: 5 pausas", "Haga 5 pausas de espalda baja."],
    ["brazo", "Muñecas de pianista", "Hombro y muñeca: 5 pausas", "Haga 5 pausas de hombro y muñeca."],
    ["ojos", "Ojos de águila", "Ojos y pantalla: 5 pausas", "Haga 5 pausas de ojos y pantalla."],
    ["respira", "Pulmones de buzo", "Respiración: 5 pausas", "Haga 5 respiraciones guiadas."],
    ["piernas", "Piernas de maratonista", "Piernas: 5 pausas", "Haga 5 pausas de piernas y circulación."]
  ];
  function mejorRacha(pausas) {
    const dias = [...new Set(pausas.map(p => new Date(p.fecha).toLocaleDateString("en-CA")))].sort();
    let mejor = 0, run = 0, prev = null;
    dias.forEach(d => {
      const t = Date.parse(d + "T12:00:00");
      run = prev !== null && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1;
      prev = t; mejor = Math.max(mejor, run);
    });
    return mejor;
  }
  /* devuelve todas las insignias con su avance; el nombre divertido solo se usa si el tono lo permite */
  M.insignias = function () {
    const pausas = M.leer("pausas"), cod = M.perfil().codigo;
    const evs = M.leer("evaluaciones").filter(e => !cod || e.codigo === cod).sort((a, b) => b.fecha.localeCompare(a.fecha));
    const racha = mejorRacha(pausas), alegre = M.humor() > 0;
    const cuenta = r => pausas.filter(p => p.rutina === r).length;
    const lista = [
      ["debut", "Debut en escena", "Primera pausa", "Haga su primera pausa guiada.", pausas.length, 1],
      ["diez", "Pausador profesional", "Diez pausas", "Complete 10 pausas guiadas.", pausas.length, 10],
      ...RUTINAS.map(([id, g, n, d]) => ["r_" + id, g, n, d, cuenta(id), 5]),
      ["racha3", "Imparable", "3 días seguidos", "Haga pausas 3 días seguidos.", racha, 3],
      ["racha5", "Semana perfecta", "5 días seguidos", "Haga pausas 5 días seguidos.", racha, 5],
      ["inspector", "Inspector del puesto", "Primera revisión", "Revise su puesto en «Mi puesto».", evs.length, 1],
      ["verde", "Puesto de revista", "Puesto en verde", "Deje su puesto en verde en la revisión.", evs[0] && evs[0].nivel === "verde" ? 1 : 0, 1]
    ];
    return lista.map(([id, gracioso, neutro, desc, valor, meta]) => ({ id, nombre: alegre ? gracioso : neutro, desc, valor: Math.min(valor, meta), meta, ganada: valor >= meta }));
  };
  /* insignias ganadas que todavía no se le han anunciado al trabajador */
  M.nuevasInsignias = function () {
    let vistas = []; try { vistas = JSON.parse(M.ls.get("mps_insignias") || "[]"); } catch (e) {}
    const ganadas = M.insignias().filter(i => i.ganada);
    const nuevas = ganadas.filter(i => !vistas.includes(i.id));
    M.ls.set("mps_insignias", JSON.stringify(ganadas.map(i => i.id)));
    return nuevas;
  };
  /* lo que ya estaba ganado antes de estrenar esto no se anuncia como nuevo */
  if (M.ls.get("mps_insignias") === null) M.ls.set("mps_insignias", JSON.stringify(M.insignias().filter(i => i.ganada).map(i => i.id)));

  /* ---------- selector de tono en «Mis datos» ---------- */
  const DESC = {
    serio: "Sin bromas ni frases chistosas.",
    cercano: "Saludos y mensajes finales con humor suave, y una frase del personaje por pausa.",
    divertido: "Todo lo anterior, más dos frases por pausa y el chiste del día."
  };
  const sel = $$('input[name="tono"]');
  const marcar = () => { sel.forEach(r => { r.checked = r.value === M.tono(); }); $("#tonoDesc").textContent = DESC[M.tono()]; };
  sel.forEach(r => r.addEventListener("change", () => { M.ls.set("mps_tono", r.value); marcar(); M.refrescar(); }));
  marcar();
})(window.MPS);
