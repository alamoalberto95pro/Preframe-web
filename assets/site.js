/* ─────────────────────────────────────────────────────────────────────
   PreFrame Web — comportamiento común a todas las páginas.

   Sin dependencias, sin build. Lo que hay aquí:
     · Rellena los `data-brand` con los valores de `brand.js`.
     · Analítica propia sin cookies: beacon a hit.preframe-app.com
       (pageview + intención de descarga) — roadmap 16.
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

  /* ─── 2. Analítica: la propia (roadmap 16) ──────────────────────────
     Desde el 16-sept-2026 los eventos SÍ se envían: un beacon mínimo al
     Worker `preframe-hit` (hit.preframe-app.com), que filtra bots, añade
     el país y guarda la fila anónima en `web_events` — el dashboard de
     metrics-preframe la pinta. Sin cookies y sin almacenamiento, como
     promete la privacidad: aquí no se persiste ni se lee nada.

     El beacon viaja como text/plain a propósito: evita el preflight CORS.
     Si el Worker no existe o falla, sendBeacon muere en silencio y la
     página ni se entera — la analítica jamás rompe la web.

     El beacon de Cloudflare Web Analytics (head) sigue como termómetro
     de contraste. La cola local `preframeEvents` se mantiene para poder
     inspeccionar en consola. */

  var HIT_ENDPOINT = 'https://hit.preframe-app.com';

  /* (f4) La campaña de origen viaja en el enlace (?utm_source=tiktok…):
     se captura aquí y acompaña a todos los eventos de esta página. Es un
     dato del enlace, no de la persona. */
  var utm = { source: null, campaign: null };
  try {
    var qs = new URLSearchParams(window.location.search);
    utm.source = qs.get('utm_source') || null;
    utm.campaign = qs.get('utm_campaign') || null;
  } catch (e) { /* URLSearchParams siempre está; por si acaso */ }

  function beacon(type, extra) {
    try {
      var payload = {
        type: type,
        path: window.location.pathname,
        lang: document.documentElement.lang === 'es' ? 'es' : 'en',
        referrer: document.referrer || null,
        utm_source: utm.source,
        utm_campaign: utm.campaign,
      };
      if (extra) for (var k in extra) payload[k] = extra[k];
      if (navigator.sendBeacon) {
        navigator.sendBeacon(HIT_ENDPOINT, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
      }
    } catch (e) {
      /* nunca romper la página por medir */
    }
  }

  window.preframeEvents = window.preframeEvents || [];

  function track(name, detail) {
    window.preframeEvents.push({ name: name, detail: detail || null, at: Date.now() });
    if (name === 'download_intent') beacon('download_click');
  }

  /* Cada página vista, una vez, al cargar. */
  beacon('pageview');

  /* (f4) Tiempo de atención REAL: se cuentan solo los segundos con la
     pestaña visible (Page Visibility API). Al ocultarse la página se envía
     el parcial acumulado y se resetea — pueden salir varios parciales por
     página y el panel los suma; así no se pierde nada aunque iOS mate la
     pestaña sin avisar. `pagehide` es la red por si el navegador salta el
     visibilitychange final. */
  var visibleSince = document.visibilityState === 'visible' ? Date.now() : null;
  var pendingSeconds = 0;

  function flushTime() {
    if (visibleSince != null) {
      pendingSeconds += (Date.now() - visibleSince) / 1000;
      visibleSince = null;
    }
    var s = Math.round(pendingSeconds);
    if (s >= 1) {
      beacon('pageview_end', { seconds: s });
      pendingSeconds = 0;
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flushTime();
    else if (visibleSince == null) visibleSince = Date.now();
  });
  window.addEventListener('pagehide', flushTime);

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
