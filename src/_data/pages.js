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
  terms: { path: '/legal/terms/', sitemap: false },
  privacy: { path: '/legal/privacy/', sitemap: false },
  aviso: { path: '/legal/aviso-legal/', sitemap: false },
};
