/* ─────────────────────────────────────────────────────────────────────
   Preframe Web — la franja del día del bento.

   La sección de capacidades es ahora un bento grid estático (las pestañas
   con scroll pegado se retiraron); lo único que se mueve aquí es la marca
   del sol recorriendo el día en la tarjeta de hora dorada. La ventana
   dorada se queda fija: es una ventana que se abre y se cierra, y verla
   pasar lo explica sin una palabra.

   18 segundos por día completo. Solo corre con la tarjeta en pantalla y
   nunca con `prefers-reduced-motion`.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ─── La tarjeta que late ───────────────────────────────────────────
     Réplica del "cinematic breathing" del editor: la envolvente sale de la
     silueta de la onda (timeline-data) recorrida en bucle, y los picos por
     encima de un umbral hacen de transitorio — el destello del golpe. La
     misma fórmula de sombra que usa la app: crece con la energía. */
  var beatCard = document.querySelector('[data-beat-card]');
  var DATA = window.PREFRAME_TIMELINE;
  var reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (beatCard && DATA && !reducedQuery.matches && window.IntersectionObserver) {
    var beatHost = beatCard.closest('.bento-card') || beatCard.parentElement;
    var LOOP = 5200;
    var beatRaf = 0;
    var beatStart = 0;

    var beatFrame = function (now) {
      beatRaf = window.requestAnimationFrame(beatFrame);
      if (!beatStart) beatStart = now;
      var t = ((now - beatStart) % LOOP) / LOOP;

      var raw = DATA.amplitudeAt(Math.round(t * 128), 128);   /* 0..~1 */
      var e = Math.max(0, Math.min(1, raw));
      var transient = raw > 0.82;                             /* el golpe */

      var spread = Math.round(4 + e * 16);
      var blur = Math.round(12 + e * 48);
      var alpha = (0.15 + e * 0.40).toFixed(2);
      var shadow = '0 2px ' + blur + 'px ' + spread + 'px rgba(232,129,74,' + alpha + ')';
      if (transient) shadow += ', 0 0 ' + (blur + 30) + 'px ' + (spread + 10) + 'px rgba(232,129,74,0.5)';

      beatCard.style.boxShadow = shadow;
      beatCard.style.transform = 'scale(' + (1 + e * 0.02) + ')';
    };

    new window.IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!beatRaf) beatRaf = window.requestAnimationFrame(beatFrame);
      } else if (beatRaf) {
        window.cancelAnimationFrame(beatRaf);
        beatRaf = 0;
        beatStart = 0;
      }
    }, { threshold: 0 }).observe(beatHost);
  }

  var marker = document.querySelector('[data-sun-now]');
  if (!marker) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !window.IntersectionObserver) {
    marker.style.left = '38%';   /* pose quieta: media tarde */
    return;
  }

  var host = marker.closest('.bento-card') || marker.parentElement;
  var DAY = 18000;
  var rafId = 0;
  var startedAt = 0;

  function frame(now) {
    rafId = window.requestAnimationFrame(frame);
    if (!startedAt) startedAt = now;
    marker.style.left = ((((now - startedAt) % DAY) / DAY) * 100) + '%';
  }

  new window.IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      if (!rafId) rafId = window.requestAnimationFrame(frame);
    } else if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
      startedAt = 0;
    }
  }, { threshold: 0 }).observe(host);

  if (reduced.addEventListener) {
    reduced.addEventListener('change', function () {
      if (!reduced.matches) return;
      window.cancelAnimationFrame(rafId);
      rafId = 0;
      marker.style.left = '38%';
    });
  }
})();
