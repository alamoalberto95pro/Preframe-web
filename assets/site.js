/* ─────────────────────────────────────────────────────────────────────
   PreFrame Web — comportamiento común a todas las páginas.

   Sin dependencias, sin build. Lo que hay aquí:
     · Rellena los `data-brand` con los valores de `brand.js`.
     · Gancho de analítica en la intención de descarga.
     · Año del footer.
   (El CTA de móvil "Send this to your Mac" se quitó el 15-sept-2026.)

   Nada de esto escribe cookies ni `localStorage`: de eso depende que la web
   no necesite banner de cookies.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var BRAND = window.BRAND || {};

  /* ─── 1. Valores de marca ──────────────────────────────────────────── */

  function readPath(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return acc == null ? acc : acc[key];
    }, obj);
  }

  /* El wordmark: PREframe con el PRE en degradado. Se construye con nodos,
     no con innerHTML, y sustituye al texto de reserva del HTML. */
  function renderWordmark(el) {
    var wm = BRAND.wordmark;
    if (!wm) return;
    el.textContent = '';
    var pre = document.createElement('b');
    pre.className = 'wm-pre';
    pre.textContent = wm.pre;
    el.appendChild(pre);
    el.appendChild(document.createTextNode(wm.rest));
  }

  document.querySelectorAll('[data-brand]').forEach(function (el) {
    if (el.getAttribute('data-brand') === 'name') {
      renderWordmark(el);
      return;
    }
    var value = readPath(BRAND, el.getAttribute('data-brand'));
    /* null/undefined = dato que todavía no existe (versión, tamaño, email).
       Se deja el contenido de reserva del HTML, que ya dice que está
       pendiente, en vez de pintar "null". */
    if (value !== null && value !== undefined && value !== '') {
      el.textContent = String(value);
    }
  });

  var year = new Date().getFullYear();
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(year);
  });

  /* ─── 2. Analítica: intención de descarga ───────────────────────────
     La única métrica que importa. Las páginas vistas ya las mide el
     beacon de Cloudflare Web Analytics (en el head, sin cookies), pero
     no acepta eventos custom, así que estos se acumulan en una cola
     local y no se envían a ningún sitio. Si algún día hace falta
     medirlos de verdad, tocará otro proveedor — sin cookies. */

  window.preframeEvents = window.preframeEvents || [];

  function track(name, detail) {
    window.preframeEvents.push({ name: name, detail: detail || null, at: Date.now() });
  }

  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      track(el.getAttribute('data-track'), el.getAttribute('data-track-detail'));
    });
  });

  /* ─── 4. Enlace activo en la navegación ─────────────────────────────── */

  var path = window.location.pathname.replace(/index\.html$/, '');
  document.querySelectorAll('.nav-links a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    var linkPath = new URL(href, window.location.href).pathname.replace(/index\.html$/, '');
    if (linkPath !== '/' && path.indexOf(linkPath) === 0) {
      link.setAttribute('aria-current', 'page');
    }
  });
})();
