/* tema.js - apariencia clara, oscura o automática (sigue a Windows).
   El PDF sale siempre en claro: el CSS del modo oscuro solo vale en pantalla (@media screen).
   El atributo data-tema de <html> lo pone primero un script corto en el <head> para que no parpadee. */
(function (M) {
  "use strict";
  const { $$ } = M;
  const raiz = document.documentElement;
  const sistema = matchMedia("(prefers-color-scheme: dark)");
  const elegido = () => { const t = M.ls.get("mps_tema"); return t === "claro" || t === "oscuro" ? t : "auto"; };
  const aplicar = () => { raiz.dataset.tema = elegido() === "oscuro" || (elegido() === "auto" && sistema.matches) ? "oscuro" : "claro"; };

  const radios = $$('input[name="tema"]');
  const marcar = () => radios.forEach(r => { r.checked = r.value === elegido(); });
  radios.forEach(r => r.addEventListener("change", () => { M.ls.set("mps_tema", r.value); aplicar(); marcar(); }));
  sistema.addEventListener("change", aplicar);
  marcar(); aplicar();

})(window.MPS);
