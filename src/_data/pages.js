/* ─────────────────────────────────────────────────────────────────────
   Las cinco páginas que Eleventy genera, y solo esas.

   `path` es la ruta en INGLÉS, que es la que está publicada y no puede
   cambiar. La ruta española se obtiene anteponiendo el prefijo del idioma
   (`/es`), así que aquí no hay una segunda lista que mantener.

   El orden de las claves es el orden del sitemap: se respeta el que ya
   tenía el sitemap.xml escrito a mano.
   ───────────────────────────────────────────────────────────────────── */

/* Las legales entran al build (bilingües) pero NO al sitemap: van con
   `noindex`, igual que cuando eran HTML a mano. `sitemap: false` es lo que
   filtra src/sitemap.njk. */
module.exports = {
  home: { path: '/', changefreq: 'weekly', priority: '1.0', lastmod: '2026-08-07' },
  download: { path: '/download/', changefreq: 'weekly', priority: '0.9', lastmod: '2026-08-07' },
  pricing: { path: '/pricing/', changefreq: 'monthly', priority: '0.8', lastmod: '2026-08-07' },
  support: { path: '/support/', changefreq: 'monthly', priority: '0.6', lastmod: '2026-08-07' },
  releases: { path: '/releases/', changefreq: 'weekly', priority: '0.5', lastmod: '2026-08-07' },
  /* /guides/ es el ÍNDICE de las guías (roadmap 17). Los artículos NO viven
     aquí: son Markdown en src/{en,es}/guides/ y entran al sitemap por la
     colección `guides`, cada uno con su fecha. */
  guides: { path: '/guides/', changefreq: 'weekly', priority: '0.7', lastmod: '2026-09-17' },
  /* /beta/ es la página PRIVADA de descarga para los filmmakers de la
     beta: `noindex`, fuera del sitemap y sin un solo enlace entrante desde
     el sitio. Se llega solo por el enlace que pasa Alberto en privado.
     Cuando la descarga sea pública, esta página se borra o se queda quieta
     (roadmap BETA, Fase 2). */
  beta: { path: '/beta/', sitemap: false },
  terms: { path: '/legal/terms/', sitemap: false },
  privacy: { path: '/legal/privacy/', sitemap: false },
  aviso: { path: '/legal/aviso-legal/', sitemap: false },
};
