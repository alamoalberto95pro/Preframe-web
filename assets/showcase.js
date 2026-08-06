/* ─────────────────────────────────────────────────────────────────────
   Preframe Web — capacidades: pestañas que avanzan con el scroll.

   Estructura tomada de la página de Final Cut Pro (una idea a la vez, con su
   objeto grande al lado) y recorrido tomado del patrón que usan Linear y
   Apple para sus secciones largas: el bloque se queda pegado en pantalla y
   el contenido avanza mientras bajas.

   Importante: esto NO secuestra el scroll. La página se mueve a su velocidad
   normal; lo único que se hace es mapear la posición a una pestaña. Bajar
   sigue bajando y subir sigue subiendo.

   Fuera del recorrido queda todo lo demás:
     · en móvil y tablet, o con `prefers-reduced-motion`, no hay pegado ni
       avance automático: es una lista normal con pestañas pulsables,
     · sin JavaScript se ve el primer panel y las descripciones de todas las
       pestañas siguen leyéndose, porque el texto vive en la propia pestaña.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var root = document.querySelector('[data-showcase]');
  if (!root) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-tab]'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('[data-panel]'));
  if (!tabs.length) return;

  var scroller = document.querySelector('[data-showcase-scroll]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wide = window.matchMedia('(min-width: 1025px)');

  var current = -1;

  function select(index, focus) {
    if (index === current) {
      if (focus) tabs[index].focus();
      return;
    }
    current = index;

    tabs.forEach(function (tab, i) {
      var active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach(function (panel, i) {
      var active = i === index;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
  }

  /* ─── Pulsar y teclado ──────────────────────────────────────────────
     Con el recorrido activo, elegir una pestaña lleva al punto del scroll
     que le corresponde: si no, el scroll la sobrescribiría al instante. */
  function scrollToStep(index) {
    if (!driving()) return;
    var total = scroller.offsetHeight - window.innerHeight;
    var top = scroller.offsetTop + (index / tabs.length) * total + 8;
    window.scrollTo({ top: top, behavior: reduced.matches ? 'auto' : 'smooth' });
  }

  tabs.forEach(function (tab, index) {
    tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;

    tab.addEventListener('click', function () {
      select(index, false);
      scrollToStep(index);
    });

    tab.addEventListener('keydown', function (event) {
      var step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      var next = (index + step + tabs.length) % tabs.length;
      select(next, true);
      scrollToStep(next);
    });
  });

  /* ─── El recorrido ──────────────────────────────────────────────────── */

  function driving() {
    return !!scroller && wide.matches && !reduced.matches;
  }

  if (scroller) {
    var ticking = false;

    var sync = function () {
      ticking = false;
      if (!driving()) return;

      var total = scroller.offsetHeight - window.innerHeight;
      if (total <= 0) return;

      var progress = Math.max(0, Math.min(1, -scroller.getBoundingClientRect().top / total));
      select(Math.min(tabs.length - 1, Math.floor(progress * tabs.length)), false);

      /* Barra de avance del bloque: dice cuánto queda de esta sección. */
      root.style.setProperty('--showcase-progress', progress);
    };

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sync);
    }, { passive: true });

    window.addEventListener('resize', sync, { passive: true });
    sync();
  }

  select(0, false);

  /* ─── La franja del día, corriendo ──────────────────────────────────
     18 segundos por día completo. La hora dorada es una ventana que se abre
     y se cierra: verla moverse lo explica sin una palabra. */
  var marker = root.querySelector('[data-sun-now]');

  if (marker && !reduced.matches && window.IntersectionObserver) {
    var rafId = 0;
    var startedAt = 0;
    var DAY = 18000;

    var frame = function (now) {
      rafId = window.requestAnimationFrame(frame);
      if (!startedAt) startedAt = now;
      marker.style.left = ((((now - startedAt) % DAY) / DAY) * 100) + '%';
    };

    new window.IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!rafId) rafId = window.requestAnimationFrame(frame);
      } else if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
        startedAt = 0;
      }
    }, { threshold: 0 }).observe(root);
  }
})();
