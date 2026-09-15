/* ─────────────────────────────────────────────────────────────────────
   PreFrame Web — generador de las páginas con navegación.

   El sitio SIGUE siendo estático puro: GitHub Pages sirve la raíz del repo
   y el deploy es un push. Lo único que hace Eleventy es escribir en esa
   raíz los HTML de las cinco páginas que comparten nav y footer, en dos
   idiomas, para que no haya cinco copias del mismo <nav> a mano.

     input   src/            plantillas + diccionarios
     output  .               la propia raíz del repo (lo que sirve Pages)

   Eleventy NO borra lo que ya hay (nada de limpiar el directorio de
   salida): assets/, legal/, buy/, 404.html, CNAME y .nojekyll conviven con
   los artefactos generados y no se tocan.

   Tampoco hay passthrough copy: `assets/` ya vive en la raíz, servido tal
   cual, y copiarlo sería duplicarlo sobre sí mismo.
   ───────────────────────────────────────────────────────────────────── */

export default function (eleventyConfig) {
  /* Nada de lo que ya está publicado a mano entra al build. Eleventy solo
     mira dentro de `src/`, pero los ignores dejan la intención por escrito
     y protegen de un `--input` accidental. */
  eleventyConfig.ignores.add('README.md');
  eleventyConfig.ignores.add('Docs/**');
  eleventyConfig.ignores.add('legal/**');
  eleventyConfig.ignores.add('buy/**');
  eleventyConfig.ignores.add('tools/**');
  eleventyConfig.ignores.add('assets/**');
  eleventyConfig.ignores.add('404.html');
  eleventyConfig.ignores.add('node_modules/**');

  /* En `--serve`, mirar solo lo que el build consume. */
  eleventyConfig.watchIgnores.add('node_modules/**');

  return {
    dir: {
      input: 'src',
      output: '.',
      includes: '_includes',
      data: '_data',
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
}
