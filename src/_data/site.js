/* ─────────────────────────────────────────────────────────────────────
   Datos del sitio que no son copy: dominio, idiomas y sus códigos.

   El rótulo del cambio de idioma ("EN" / "ES") vive AQUÍ y no en los
   diccionarios a propósito: es un código de idioma, no una frase que se
   traduzca, y si viviese en el diccionario la copia es→en de esta fase
   haría que la página española ofreciese cambiar a español.
   ───────────────────────────────────────────────────────────────────── */

module.exports = {
  url: 'https://www.preframe-app.com',

  /* `prefix` es lo que se antepone a las rutas EN para obtener las del
     idioma. El inglés vive en la raíz: no cambia ni una URL publicada. */
  languages: {
    en: { code: 'en', label: 'EN', ogLocale: 'en_US', prefix: '' },
    es: { code: 'es', label: 'ES', ogLocale: 'es_ES', prefix: '/es' },
  },
};
