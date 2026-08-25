/* ─────────────────────────────────────────────────────────────────────
   Lo que cada página necesita saber de sí misma, calculado una vez.

   Vive en el cascade de datos y no en un `{% set %}` del layout a
   propósito: la plantilla de contenido se renderiza ANTES del layout, así
   que un `set` del layout no llegaría a ella. Aquí sí llega a las dos.

     lang   idioma, del directory data de src/en y src/es
     key    clave de página, del front matter del stub

   `sitemap.njk` no tiene ni `lang` ni `key`: de ahí las guardas.
   ───────────────────────────────────────────────────────────────────── */

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
    data.key ? data.site.url + data.site.languages.en.prefix + data.pages[data.key].path : null,
  urlEs: (data) =>
    data.key ? data.site.url + data.site.languages.es.prefix + data.pages[data.key].path : null,

  canonical: (data) => {
    if (!data.key || !data.lang) return null;
    return data.site.url + data.site.languages[data.lang].prefix + data.pages[data.key].path;
  },

  /* Destino del conmutador de idioma: la MISMA página en el otro idioma,
     nunca la home. Ruta relativa a la raíz. */
  altUrl: (data) => {
    if (!data.key || !data.lang) return null;
    const other = data.lang === 'es' ? 'en' : 'es';
    return data.site.languages[other].prefix + data.pages[data.key].path;
  },

  /* Atajos al diccionario: `S` lo compartido, `C` el copy de esta página. */
  S: (data) => (data.lang ? data.t[data.lang].shared : null),
  C: (data) => (data.lang && data.key ? data.t[data.lang][data.key] : null),
};
