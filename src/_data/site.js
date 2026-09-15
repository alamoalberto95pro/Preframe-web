/* ─────────────────────────────────────────────────────────────────────
   Datos del sitio que no son copy: dominio, idiomas y sus códigos.

   El rótulo del cambio de idioma ("EN" / "ES") vive AQUÍ y no en los
   diccionarios a propósito: es un código de idioma, no una frase que se
   traduzca, y si viviese en el diccionario la copia es→en de esta fase
   haría que la página española ofreciese cambiar a español.
   ───────────────────────────────────────────────────────────────────── */

module.exports = {
  url: 'https://www.preframe-app.com',

  /* ── INTERRUPTOR DE PRECIOS ──────────────────────────────────────────
     `false` = modo pre-lanzamiento: la web se publica sin un solo importe
     de venta. Las secciones de precio siguen enteras (tarjetas, packs,
     letra pequeña); lo único que cambia es que en lugar de la cifra se
     lee "Disponible en el lanzamiento" y la rejilla de packs se sustituye
     por una línea. El JSON-LD suelta su bloque `offers`, porque marcar un
     precio que no está en la página es justo lo que Google penaliza.

     El día del lanzamiento: poner `true`, `npm run build`, y vuelven los
     9,99 € / 19,99 € y los packs tal como estaban. No hay que reescribir
     nada — los textos con cifras nunca se han borrado.
     (Decisión 15-sept-2026: publicar la web antes que Stripe.) */
  pricesPublic: false,

  /* `prefix` es lo que se antepone a las rutas EN para obtener las del
     idioma. El inglés vive en la raíz: no cambia ni una URL publicada. */
  languages: {
    en: { code: 'en', label: 'EN', ogLocale: 'en_US', prefix: '' },
    es: { code: 'es', label: 'ES', ogLocale: 'es_ES', prefix: '/es' },
  },
};
