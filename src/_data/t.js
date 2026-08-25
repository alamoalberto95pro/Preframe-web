/* ─────────────────────────────────────────────────────────────────────
   Diccionarios de copy. Todo el texto visible de las cinco páginas sale
   de aquí — cuerpo, títulos, `alt`, `aria-label`, meta description y los
   rótulos del raíl (`data-rail`).

   Se usa como `t[lang].home.hero.title`, siempre con `| safe`: los valores
   son fragmentos de HTML ya escapados (llevan <em>, <strong>, <br> y las
   entidades que hicieran falta), así que Nunjucks no debe volver a
   escaparlos.

   `i18n/en/` e `i18n/es/` están traducidos y tienen la MISMA forma: mismas
   claves, mismo anidamiento y el mismo markup embebido en cada valor. Añadir
   o cambiar copy es tocar los dos ficheros del namespace, nunca la plantilla.

   EXCEPCIÓN — mockups y capturas van SIEMPRE en inglés, en los dos idiomas
   (decisión de Alberto, 2026-08-14): son una foto del producto, no copy que
   se traduzca. Afecta al chrome del lienzo del Mood Bar (`mood.chips`,
   `toolbar`, `curveLabel`, `shotType`…), al instrumento del timeline
   (`instrument.lane`, `sections`, `mode*`, `readout`, `gap*`) y a la etiqueta
   del widget solar. Si tocas una de esas claves, cámbiala en los DOS
   ficheros con el mismo valor inglés.

   Lo que sí se traduce alrededor: títulos, ledes, listas de capacidades,
   `aria-label` que describen el mockup y los `stage-hint` que invitan al
   visitante a tocarlo.
   ───────────────────────────────────────────────────────────────────── */

const LANGS = ['en', 'es'];
const NAMESPACES = ['shared', 'home', 'pricing', 'support', 'download', 'releases'];

module.exports = function () {
  const dict = {};

  for (const lang of LANGS) {
    dict[lang] = {};
    for (const ns of NAMESPACES) {
      /* `require` cachea, pero Eleventy reinicia el proceso en cada build
         y en `--serve` invalida el módulo de datos, así que no hace falta
         limpiar la caché a mano. */
      dict[lang][ns] = require(`./i18n/${lang}/${ns}.json`);
    }
  }

  return dict;
};
