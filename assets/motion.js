/* ─────────────────────────────────────────────────────────────────────
   PreFrame Web — movimiento de página.

   Dos cosas, las dos de scroll:

   1. Las secciones ENTRAN al llegar a ellas (suben y aparecen), escalonadas
      dentro de cada grupo. Es lo que hace que apple.com se sienta como se
      siente: el contenido no está esperándote, llega.
   2. La barra superior se condensa al separarse de arriba.

   Regla de oro: si este archivo no llega a ejecutarse, la web se ve entera
   igualmente. El estado oculto solo existe bajo `.has-motion`, que se pone
   desde aquí — nunca en el HTML.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var supported = 'IntersectionObserver' in window;

  /* ─── 1. Entrada de secciones ──────────────────────────────────────── */

  /* Qué entra. Se elige por selector y no con atributos en el HTML para no
     salpicar el marcado de una decisión puramente visual. El hero queda
     fuera a propósito: está sobre el pliegue y ya tiene su animación. */
  /* Dos sabores, como en las páginas de producto de Apple: el texto entra
     con fundido y una subida corta; las piezas grandes de imagen, solo con
     fundido, sin desplazarse. */
  var TARGETS = [
    '.band .eyebrow', '.band-tight .eyebrow',
    '.band h2', '.band-tight h2',
    '.band > .wrap > p', '.band-tight > .wrap > p',
    '.step', '.card', '.bento-card', '.price', '.pack', '.cf-step',
    '.duo-card',                    /* las ventanas gemelas entran una tras otra */
    '.faq details', '.founder-layout', '.frame',
    '.feature', '.mac',
    '.cm-card',                     /* el canvas se puebla tarjeta a tarjeta */
    '.canvas-caps li',
    '.fb-copy > *',                 /* el texto sobre las capturas de fondo */
    '.split > div', '.notice', '.placeholder', '.release',
  ].join(',');

  /* Solo fundido. Ojo: estos elementos se añaden DESPUÉS del filtro de
     anidados, así que pueden vivir dentro de un elemento de TARGETS (la
     hoja del PDF dentro de su columna) sin quedar excluidos. */
  var FADE_ONLY = [
    '.bg-feature-img',
    '.paper-real',
    '.canvasmock .cm-chips',
    '.canvasmock .cm-toolbar',
  ].join(',');

  if (supported && !reduced.matches) {
    document.documentElement.classList.add('has-motion');

    var elements = Array.prototype.slice.call(document.querySelectorAll(TARGETS));
    var fadeOnly = Array.prototype.slice.call(document.querySelectorAll(FADE_ONLY));

    /* Nada anidado: si un elemento ya entra dentro de otro que entra (una
       captura dentro de su paso, por ejemplo), se queda fuera de la lista.
       Si no, se animaría dos veces y se notaría. */
    var candidates = new Set(elements);
    elements = elements.filter(function (el) {
      var parent = el.parentNode;
      while (parent && parent !== document.body) {
        if (candidates.has(parent)) return false;
        parent = parent.parentNode;
      }
      return true;
    });

    /* La clase la pone el JS, no el HTML: así la lista de qué entra existe
       en un solo sitio (aquí) y el CSS no puede desincronizarse y dejar algo
       oculto para siempre. */
    elements.forEach(function (el) { el.classList.add('reveal'); });
    fadeOnly.forEach(function (el) {
      el.classList.add('reveal', 'reveal-fade');
      elements.push(el);
    });

    /* Escalonado por grupo: los hermanos de una misma rejilla entran uno
       detrás de otro, no todos de golpe. */
    var counters = new Map();
    elements.forEach(function (el) {
      var parent = el.parentNode;
      var index = counters.get(parent) || 0;
      counters.set(parent, index + 1);
      if (index > 0) el.style.transitionDelay = Math.min(index * 70, 350) + 'ms';
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);   /* entra una vez, no en bucle */
        });
      },
      /* Se dispara un poco antes de que el elemento llegue del todo: al
         terminar de subir ya está en su sitio, sin el tirón de última hora. */
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 }
    );

    elements.forEach(function (el) { observer.observe(el); });

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
