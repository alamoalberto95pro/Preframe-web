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
  name: 'Preframe',
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
      requirements: 'macOS 12+ · Apple Silicon & Intel',
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
    founder: '€9.99',
    standard: '€19.99',
    currency: 'EUR',
    maxPerAccount: 2,
    founderLimit: 'first 100 buyers or six months',
  },
};
