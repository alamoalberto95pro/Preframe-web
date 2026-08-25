/* ─────────────────────────────────────────────────────────────────────
   Preframe Web — constantes de marca y estado del producto.

   Punto único de verdad para los datos que se repiten en varias páginas y
   que cambian con el tiempo: nombre, dominio, disponibilidad de descarga,
   precios. Los rellena `site.js` en los elementos con `data-brand="clave"`.

   Cada uno de esos elementos lleva su valor escrito en el HTML como
   contenido de reserva, así que la página se lee entera sin JavaScript;
   `site.js` solo lo sustituye si el valor cambia. Un rebrand futuro se hace
   aquí y con un grep del literal en la prosa de las páginas.
   ───────────────────────────────────────────────────────────────────── */

window.BRAND = {
  name: 'PreFrame',

  /* El wordmark visual: PREframe, con el PRE en degradado de marca. Las dos
     mitades viven aquí para que un rebrand siga siendo un solo archivo.
     `site.js` lo renderiza en cada [data-brand="name"]. */
  wordmark: { pre: 'Pre', rest: 'Frame' },
  domain: 'preframe-app.com',
  url: 'https://www.preframe-app.com',

  /* Bundle id de la app de escritorio. Irreversible tras publicar. */
  appId: 'com.preframe.desktop',

  /* [MANUAL · pendiente] Correo de soporte sobre el dominio propio.
     Mientras sea null, /support muestra el aviso de "pendiente" en vez de
     un mailto inventado. */
  supportEmail: null,

  /* ─── Descarga ───────────────────────────────────────────────────────
     macOS: el .dmg firmado y notarizado no existe todavía (Fase 8 de la
     app). Con `available: false` el botón se pinta presente pero
     deshabilitado y NO apunta a ninguna release.

     [FUTURO] Al activarlo, ojo con dos cosas ya conocidas:
       · `releases/latest/download/<archivo>` no sirve con los nombres
         versionados de electron-builder → fijar `artifactName` estable o
         inyectar la URL en build con una GitHub Action.
       · El repo que aloje las releases tiene que ser público.
     Windows: sin fecha y sin waitlist. Solo "coming soon". */
  download: {
    mac: {
      available: false,
      url: null,
      version: null,        /* no inventar: se rellena al publicar */
      size: null,

      /* Texto visible: depende del idioma de la página, igual que
         `price.founderLimit`. Sin esto, el HTML servía español y el JS lo
         reescribía en inglés al hidratar. El idioma sale del `<html lang>`
         que escribe el generador; nada de almacenamiento. */
      requirements: (function () {
        var byLang = {
          en: 'macOS 12+ · Apple Silicon & Intel',
          es: 'macOS 12+ · Apple Silicon e Intel',
        };
        return byLang[document.documentElement.lang === 'es' ? 'es' : 'en'];
      })(),
    },
    windows: {
      available: false,
    },
  },

  /* ─── Precio ─────────────────────────────────────────────────────────
     Un crédito = un proyecto. El crédito se consume al crear el proyecto
     (RPC `create_project_with_credit`). Cuenta nueva = 1 crédito de
     bienvenida → el primer proyecto es gratis y completo.
     [PENDIENTE] Moneda: EUR mientras no se confirme qué muestra Stripe
     Checkout con Managed Payments a un comprador estadounidense. */
  price: {
    /* Símbolo DETRÁS del número (decisión de Alberto, 2026-08-14). El
       separador decimal sí cambia con el idioma: coma en español, punto en
       inglés. Estos valores tienen que coincidir con `shared.price.*` del
       diccionario, que es el fallback que se ve sin JavaScript. */
    founder: (function () {
      return document.documentElement.lang === 'es' ? '9,99 €' : '9.99 €';
    })(),
    standard: (function () {
      return document.documentElement.lang === 'es' ? '19,99 €' : '19.99 €';
    })(),
    currency: 'EUR',
    maxPerAccount: 2,

    /* Texto visible, así que depende del idioma de la página. El idioma sale
       del `<html lang>` que escribe el generador; nada de almacenamiento. */
    founderLimit: (function () {
      var byLang = {
        en: 'first 100 buyers or six months',
        es: 'los 100 primeros compradores o seis meses',
      };
      return byLang[document.documentElement.lang === 'es' ? 'es' : 'en'];
    })(),
  },
};
