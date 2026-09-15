/* ─────────────────────────────────────────────────────────────────────
   PreFrame Web — movimiento de página.

   Todo de scroll: el raíl lateral que sigue la lectura, el zoom de las
   secciones [data-zoom] y la barra superior, que se condensa al separarse
   de arriba.

   De la ENTRADA al hacer scroll queda solo una pieza (decisión de Alberto,
   15-sept-2026): los títulos de sección de la HOME suben y aparecen al
   llegar a ellos. Nada más entra: el resto del contenido, en todas las
   páginas, está siempre visible.

   Regla de oro: si este archivo no llega a ejecutarse, la web se ve entera
   igualmente.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ─── 1. Títulos de la home ─────────────────────────────────────────
     Solo en la portada (la única página con hero) y solo los <h2>: el
     título de cada sección sube y aparece al llegar a él. El hero queda
     fuera — está sobre el pliegue y tiene su propia entrada. El estado
     oculto vive bajo `.has-motion`, que se pone desde aquí — nunca en el
     HTML: sin JavaScript, o con "reducir movimiento", todo se ve desde el
     primer momento. */

  var isHome = !!document.querySelector('.hero');

  if (isHome && 'IntersectionObserver' in window && !reduced.matches) {
    document.documentElement.classList.add('has-motion');

    var titles = Array.prototype.slice.call(document.querySelectorAll('h2'));
    titles.forEach(function (el) { el.classList.add('reveal'); });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);   /* entra una vez, no en bucle */
        });
      },
      /* Se dispara un poco antes de que el título llegue del todo: al
         terminar de subir ya está en su sitio, sin el tirón de última hora. */
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 }
    );

    titles.forEach(function (el) { observer.observe(el); });

    /* Si alguien pide menos movimiento con la web abierta, se enseña todo. */
    if (reduced.addEventListener) {
      reduced.addEventListener('change', function () {
        if (!reduced.matches) return;
        document.documentElement.classList.remove('has-motion');
        observer.disconnect();
      });
    }
  }

  /* ─── 2. La página es un timeline ───────────────────────────────────
     Un raíl a la derecha con una marca por sección y un playhead que sigue
     el scroll. En una herramienta que va de colocar cosas en el tiempo, la
     navegación no puede ser una lista de enlaces: es una pista con
     posiciones. Solo en pantallas anchas — es un lujo, no una muleta: la
     navegación de verdad sigue estando arriba. */

  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-rail]'));

  if (sections.length > 2 && window.matchMedia('(min-width: 1280px)').matches) {
    var rail = document.createElement('nav');
    rail.className = 'rail';
    /* Idioma del `<html lang>` que escribe el generador. Sin almacenamiento. */
    var RAIL_LABEL = {
      en: 'Page sections',
      es: 'Secciones de la página',
    };
    rail.setAttribute('aria-label', RAIL_LABEL[document.documentElement.lang === 'es' ? 'es' : 'en']);

    var fill = document.createElement('span');
    fill.className = 'rail-fill';
    rail.appendChild(fill);

    var marks = sections.map(function (section, index) {
      var mark = document.createElement('a');
      mark.className = 'rail-mark';
      mark.href = '#' + (section.id || ('rail-' + index));
      if (!section.id) section.id = 'rail-' + index;
      mark.innerHTML =
        '<span class="rail-n">' + String(index + 1).padStart(2, '0') + '</span>' +
        '<span class="rail-label">' + section.getAttribute('data-rail') + '</span>';
      rail.appendChild(mark);
      return { el: mark, section: section };
    });

    document.body.appendChild(rail);

    var ticking = false;
    var sync = function () {
      ticking = false;

      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.transform = 'scaleY(' + (scrollable > 0 ? window.scrollY / scrollable : 0) + ')';

      /* Activa la sección que ocupa el centro del viewport. */
      var center = window.innerHeight / 2;
      var active = 0;
      for (var i = 0; i < marks.length; i++) {
        var rect = marks[i].section.getBoundingClientRect();
        if (rect.top <= center) active = i;
      }
      for (var m = 0; m < marks.length; m++) {
        marks[m].el.classList.toggle('is-active', m === active);
      }

      /* El raíl flota sobre secciones que alternan negro y blanco: se entinta
         según sobre cuál esté, o no se vería en la mitad de la página. */
      var canvas = marks[active].section.classList;
      rail.classList.toggle('on-light', canvas.contains('canvas-light') || canvas.contains('canvas-soft'));
    };

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sync);
    }, { passive: true });

    window.addEventListener('resize', sync, { passive: true });
    sync();
  }

  /* ─── 2b. Zoom al scroll ────────────────────────────────────────────
     Las secciones [data-zoom] interpolan --zf (0→1) con el avance del
     scroll dentro de su recorrido: la imagen nace con márgenes y crece
     hasta llenar el viewport. El texto (--zf-copy) aparece en el último
     tercio del gesto. Con reduced-motion no se toca nada: el CSS deja la
     pose final. */

  var zooms = Array.prototype.slice.call(document.querySelectorAll('[data-zoom]'));

  if (zooms.length && !reduced.matches) {
    zooms.forEach(function (el) {
      el.style.setProperty('--zf', 0);
      el.style.setProperty('--zf-copy', 0);
    });

    var zoomTick = false;
    var syncZoom = function () {
      zoomTick = false;
      for (var i = 0; i < zooms.length; i++) {
        var el = zooms[i];
        var rect = el.getBoundingClientRect();
        var vh = window.innerHeight;

        /* FASE DE APROXIMACIÓN: la imagen crece MIENTRAS la sección sube
           hacia el usuario — desde que asoma por abajo (rect.top = vh)
           hasta que la tiene de frente (rect.top = 0), donde ya llena la
           pantalla. No hay que "entrar" en la sección para que empiece. */
        var zf;
        if (rect.top >= vh) zf = 0;
        else if (rect.top <= 0) zf = 1;
        else zf = 1 - rect.top / vh;
        zf = 1 - Math.pow(1 - zf, 2);

        /* El negro con el texto funde justo cuando la imagen llega a llenar
           la pantalla — el último 8% de la aproximación. Sin retención: en
           cuanto está, la página sigue. */
        var copy = Math.max(0, Math.min(1, (zf - 0.92) / 0.08));

        el.style.setProperty('--zf', zf.toFixed(4));
        el.style.setProperty('--zf-copy', copy.toFixed(4));
      }
    };

    window.addEventListener('scroll', function () {
      if (zoomTick) return;
      zoomTick = true;
      window.requestAnimationFrame(syncZoom);
    }, { passive: true });
    window.addEventListener('resize', syncZoom, { passive: true });
    syncZoom();

    if (reduced.addEventListener) {
      reduced.addEventListener('change', function () {
        if (!reduced.matches) return;
        zooms.forEach(function (el) {
          el.style.setProperty('--zf', 1);
          el.style.setProperty('--zf-copy', 1);
        });
      });
    }
  }

  /* ─── 3. Barra superior ─────────────────────────────────────────────
     En la portada la barra no aparece hasta que se deja atrás el hero: allí
     arriba manda la marca, y una barra compitiendo con ella sobra. En el
     resto de páginas no hay hero, así que está desde el principio.

     Se hace en JS y no solo en CSS porque el estado inicial depende de si
     esta página tiene hero o no. Si el JS no llega, la barra se ve siempre:
     el fallo cae del lado seguro. */

  var nav = document.querySelector('.site-nav');
  if (nav) {
    var hero = document.querySelector('.hero');
    var scrolled = false;
    var hidden = false;

    if (hero) {
      hidden = true;
      nav.classList.add('is-hidden');
    }

    var onScroll = function () {
      var next = window.scrollY > 8;
      if (next !== scrolled) {
        scrolled = next;
        nav.classList.toggle('is-scrolled', next);
      }

      if (!hero) return;
      /* Aparece cuando el hero ya casi no se ve: un poco antes de que su
         borde inferior cruce la parte de arriba de la pantalla. */
      var nextHidden = hero.getBoundingClientRect().bottom > 120;
      if (nextHidden === hidden) return;
      hidden = nextHidden;
      nav.classList.toggle('is-hidden', hidden);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }
})();
