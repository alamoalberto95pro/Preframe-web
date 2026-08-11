/* ─────────────────────────────────────────────────────────────────────
   Preframe Web — movimiento de página.

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
  var TARGETS = [
    '.band .eyebrow', '.band-tight .eyebrow',
    '.band h2', '.band-tight h2',
    '.band > .wrap > p', '.band-tight > .wrap > p',
    '.step', '.flow li', '.pillar', '.card', '.bento-card', '.price', '.cf-step',
    '.faq details', '.paper-sheet', '.founder-quote', '.cinema', '.frame',
    '.split > div', '.notice', '.placeholder', '.release',
  ].join(',');

  if (supported && !reduced.matches) {
    document.documentElement.classList.add('has-motion');

    var elements = Array.prototype.slice.call(document.querySelectorAll(TARGETS));

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
    rail.setAttribute('aria-label', 'Page sections');

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
