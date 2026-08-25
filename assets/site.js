/* ─────────────────────────────────────────────────────────────────────
   Preframe Web — comportamiento común a todas las páginas.

   Sin dependencias, sin build. Lo que hay aquí:
     · Rellena los `data-brand` con los valores de `brand.js`.
     · CTA de móvil: "Send this to your Mac" (compartir o copiar enlace).
     · Gancho de analítica en la intención de descarga.
     · Año del footer.

   Nada de esto escribe cookies ni `localStorage`: de eso depende que la web
   no necesite banner de cookies.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var BRAND = window.BRAND || {};

  /* ─── 0. Idioma ─────────────────────────────────────────────────────
     El idioma sale del `<html lang>` que escribe el generador, y de ahí
     solamente: sin fetch, sin cookies y sin `localStorage`. El idioma vive
     en la URL, así que no hay nada que recordar. */

  var LANG = document.documentElement.lang === 'es' ? 'es' : 'en';

  var STRINGS = {
    en: {
      linkCopied: 'Link copied',
      shareTitle: '{name} — plan your shoot on a timeline',
      shareText: 'Open this on your Mac to download {name}.',
    },
    es: {
      linkCopied: 'Enlace copiado',
      shareTitle: '{name} — planifica tu rodaje en un timeline',
      shareText: 'Abre esto en tu Mac para descargar {name}.',
    },
  };

  var COPY = STRINGS[LANG];

  function fill(template, name) {
    return template.split('{name}').join(name);
  }

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
     La única métrica que importa. Todavía no hay proveedor conectado
     (pendiente de decidir Cloudflare Web Analytics / Umami / Plausible),
     así que los eventos se acumulan en una cola y el día que se conecte
     basta con vaciarla. No se envía nada a ningún tercero. */

  window.preframeEvents = window.preframeEvents || [];

  function track(name, detail) {
    window.preframeEvents.push({ name: name, detail: detail || null, at: Date.now() });
  }

  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      track(el.getAttribute('data-track'), el.getAttribute('data-track-detail'));
    });
  });

  /* ─── 3. CTA de móvil ───────────────────────────────────────────────
     Quien llega desde el móvil no puede instalar un .dmg. En vez de un
     botón de descarga inútil, se lleva el enlace: hoja de compartir del
     sistema si existe, y si no, copiar al portapapeles. */

  document.querySelectorAll('[data-send-to-mac]').forEach(function (btn) {
    var original = btn.querySelector('[data-label]') || btn;
    var originalText = original.textContent;
    var url = BRAND.url || window.location.origin;

    btn.addEventListener('click', function () {
      track('send_to_mac');

      var name = BRAND.name || 'Preframe';
      var shareData = {
        title: fill(COPY.shareTitle, name),
        text: fill(COPY.shareText, name),
        url: url,
      };

      function feedback(message) {
        original.textContent = message;
        window.setTimeout(function () {
          original.textContent = originalText;
        }, 2400);
      }

      if (navigator.share) {
        navigator.share(shareData).catch(function () {
          /* Cancelar la hoja de compartir no es un error: no se avisa. */
        });
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () { feedback(COPY.linkCopied); },
          function () { feedback(url); }
        );
        return;
      }

      feedback(url);
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
