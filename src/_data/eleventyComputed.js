/* ─────────────────────────────────────────────────────────────────────
   Lo que cada página necesita saber de sí misma, calculado una vez.

   Vive en el cascade de datos y no en un `{% set %}` del layout a
   propósito: la plantilla de contenido se renderiza ANTES del layout, así
   que un `set` del layout no llegaría a ella. Aquí sí llega a las dos.

     lang   idioma, del directory data de src/en y src/es
     key    clave de página, del front matter del stub

     guide  slug de una guía, del front matter de su Markdown (roadmap 17)

   `sitemap.njk` no tiene ni `lang` ni `key`: de ahí las guardas.
   ───────────────────────────────────────────────────────────────────── */

/* La ruta EN de esta página. Las de `pages.js` la traen escrita; una guía
   la deriva de su slug, que es EL MISMO en los dos idiomas: así el hreflang
   y el conmutador siguen saliendo de anteponer `/es`, sin una segunda lista. */
const pathOf = (data) => {
  if (data.guide) return `/guides/${data.guide}/`;
  return data.key ? data.pages[data.key].path : null;
};

module.exports = {
  /* El otro idioma: el que ofrece el conmutador. */
  other: (data) => (data.lang === 'es' ? 'en' : 'es'),

  /* La landing lleva head largo, JSON-LD, wordmark de cierre y sus scripts
     propios. Las demás, no. */
  isHome: (data) => data.key === 'home',

  /* Prefijo del idioma para las rutas internas: '' en inglés, '/es' en
     español. El inglés se queda en la raíz. */
  langBase: (data) => (data.lang ? data.site.languages[data.lang].prefix : ''),

  /* Las dos URLs absolutas de esta misma página, para canonical y hreflang. */
  urlEn: (data) =>
    pathOf(data) ? data.site.url + data.site.languages.en.prefix + pathOf(data) : null,
  urlEs: (data) =>
    pathOf(data) ? data.site.url + data.site.languages.es.prefix + pathOf(data) : null,

  canonical: (data) => {
    if (!pathOf(data) || !data.lang) return null;
    return data.site.url + data.site.languages[data.lang].prefix + pathOf(data);
  },

  /* Destino del conmutador de idioma: la MISMA página en el otro idioma,
     nunca la home. Ruta relativa a la raíz. */
  altUrl: (data) => {
    if (!pathOf(data) || !data.lang) return null;
    const other = data.lang === 'es' ? 'en' : 'es';
    return data.site.languages[other].prefix + pathOf(data);
  },

  /* La descripción del <head>. En modo pre-lanzamiento (`site.pricesPublic:
     false`) la página que cita un precio en su descripción usa la variante
     sin cifras; las demás no tienen `descriptionLaunch` y esto devuelve la
     de siempre. */
  metaDescription: (data) => {
    /* Una guía trae su descripción en el front matter, no en el diccionario. */
    if (data.guide) return data.description || null;
    if (!data.lang || !data.key) return null;
    /* Las legales tienen `key` pero no entrada en el diccionario: su prosa
       vive en el stub y su <head> lo escribe `layouts/doc.njk`, que no usa
       esto. */
    const copy = data.t[data.lang][data.key];
    if (!copy || !copy.meta) return null;
    if (!data.site.pricesPublic && copy.meta.descriptionLaunch) return copy.meta.descriptionLaunch;
    return copy.meta.description;
  },

  /* Atajos al diccionario: `S` lo compartido, `C` el copy de esta página. */
  S: (data) => (data.lang ? data.t[data.lang].shared : null),
  /* Una guía no tiene namespace propio: su prosa vive en el Markdown. Se le
     fabrica el `C.meta` que lee partials/head.njk a partir del front matter,
     para que el <head> sea EL MISMO partial que el de las demás páginas. */
  C: (data) => {
    if (data.guide) {
      return {
        meta: {
          title: `${data.title} — PreFrame`,
          ogTitle: data.title,
          ogDescription: data.description,
          ogImageAlt: data.ogImageAlt || data.title,
        },
      };
    }
    return data.lang && data.key ? data.t[data.lang][data.key] : null;
  },
};
