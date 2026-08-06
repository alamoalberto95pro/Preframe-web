/* ─────────────────────────────────────────────────────────────────────
   Preframe Web — los motivos: la onda y la curva, allá donde aparezcan.

   El waveform y la curva emocional son los dos objetos del producto, así
   que en esta web no se dibujan quietos en ningún sitio. Cada aparición
   tiene su playhead recorriéndola, con el mismo comportamiento que en el
   hero: lo que ya pasó se apaga, el punto cabalga la curva.

   Los tres motivos:
     · el waveform del pilar "The waveform",
     · la curva del pilar "The emotional curve", que además se dibuja sola
       la primera vez que entra en pantalla,
     · la regla del cierre, que es un waveform de una sola línea.

   Reglas de la casa: nada se anima fuera de pantalla, nada se anima con
   `prefers-reduced-motion`, y todo se apoya en `curve.js` para que la forma
   sea exactamente la misma que la del hero.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var DATA = window.PREFRAME_TIMELINE;
  if (!DATA || !window.PreframeCurve) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var curve = window.PreframeCurve.build(DATA.keyframes);

  /* Un ciclo algo más lento que el del hero: aquí acompaña, no protagoniza. */
  var SWEEP = 8200;

  /**
   * Arranca un bucle solo mientras el elemento está en pantalla.
   * @param {Element} el elemento que se vigila
   * @param {function(number): void} step recibe el progreso 0-1 del ciclo
   */
  function loopInView(el, step) {
    if (reduced.matches || !window.IntersectionObserver) {
      step(0.34);          /* pose quieta, legible */
      return;
    }

    var rafId = 0;
    var startedAt = 0;

    function frame(now) {
      rafId = window.requestAnimationFrame(frame);
      if (!startedAt) startedAt = now;
      step(((now - startedAt) % SWEEP) / SWEEP);
    }

    new window.IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!rafId) rafId = window.requestAnimationFrame(frame);
      } else if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
        startedAt = 0;
      }
    }, { threshold: 0 }).observe(el);
  }

  /* ═══════════════════════════════════════════════════════════════════
     1. PILAR · WAVEFORM
     ═══════════════════════════════════════════════════════════════════ */

  var waveHost = document.querySelector('[data-pillar-wave]');
  if (waveHost) {
    var COUNT = 44;
    var bars = [];
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < COUNT; i++) {
      var bar = document.createElement('div');
      bar.className = 'pb';
      /* Misma silueta que el waveform del hero, remuestreada a 44 barras. */
      bar.style.height = (12 + DATA.amplitudeAt(Math.round((i / COUNT) * 128), 128) * 62) + 'px';
      fragment.appendChild(bar);
      bars.push(bar);
    }

    var head = document.createElement('span');
    head.className = 'motif-head';
    waveHost.appendChild(fragment);
    waveHost.appendChild(head);

    loopInView(waveHost, function (t) {
      head.style.left = (t * 100) + '%';
      var index = Math.floor(t * COUNT);
      for (var b = 0; b < COUNT; b++) {
        /* La barra justo bajo el playhead se enciende; las de detrás quedan
           apagadas, como en un reproductor. */
        bars[b].style.opacity = b === index ? '1' : b < index ? '0.35' : '0.75';
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     2. PILAR · CURVA EMOCIONAL
     ═══════════════════════════════════════════════════════════════════ */

  var curveHost = document.querySelector('[data-pillar-curve]');
  if (curveHost) {
    var VIEW = { width: 1000, height: 124, pad: 10 };
    var ns = 'http://www.w3.org/2000/svg';

    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + VIEW.width + ' ' + VIEW.height);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('aria-hidden', 'true');

    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', curve.path(VIEW));
    path.setAttribute('fill', 'none');
    /* Sobre el blanco cálido del pilar hace falta el naranja entintado: el de
       marca se queda en 2,5:1 y el trazo no se lee. */
    path.setAttribute('stroke', 'var(--sunset-large)');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(path);

    /* El punto que cabalga. Va fuera del SVG, en el DOM, para no tener que
       pedirle geometría al navegador en cada frame. */
    var rider = document.createElement('span');
    rider.className = 'motif-rider';

    curveHost.appendChild(svg);
    curveHost.appendChild(rider);

    /* Se dibuja sola al entrar en pantalla la primera vez. */
    if (!reduced.matches && window.IntersectionObserver) {
      var length = 0;
      try { length = path.getTotalLength(); } catch (err) { length = 0; }

      if (length) {
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;

        new window.IntersectionObserver(function (entries, observer) {
          if (!entries[0].isIntersecting) return;
          path.style.transition = 'stroke-dashoffset 1500ms var(--ease-out)';
          path.style.strokeDashoffset = '0';
          observer.disconnect();
        }, { threshold: 0.35 }).observe(curveHost);
      }
    }

    loopInView(curveHost, function (t) {
      rider.style.left = (t * 100) + '%';
      /* La altura sale de la misma curva del hero, en porcentaje del alto
         útil: así el punto cae sobre el trazo a cualquier tamaño. */
      var usable = (VIEW.height - VIEW.pad * 2) / VIEW.height;
      rider.style.top = ((1 - (VIEW.pad / VIEW.height) - curve.valueAt(t) * usable) * 100) + '%';
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     3. CIERRE · la regla, que es un waveform de una línea
     ═══════════════════════════════════════════════════════════════════ */

  var rule = document.querySelector('[data-rule]');
  if (rule) {
    var TICKS = 90;
    var ticks = [];
    var ruleFragment = document.createDocumentFragment();

    for (var r = 0; r < TICKS; r++) {
      var tick = document.createElement('i');
      tick.style.height = (2 + DATA.amplitudeAt(Math.round((r / TICKS) * 128), 128) * 15) + 'px';
      ruleFragment.appendChild(tick);
      ticks.push(tick);
    }
    rule.appendChild(ruleFragment);

    loopInView(rule, function (t) {
      var index = t * TICKS;
      for (var k = 0; k < TICKS; k++) {
        /* Una cresta de luz que recorre la regla: se enciende lo que está
           cerca del playhead y se apaga con la distancia. */
        var distance = Math.abs(k - index);
        var heat = distance < 6 ? 1 - distance / 6 : 0;
        ticks[k].style.opacity = 0.35 + heat * 0.65;
        ticks[k].style.backgroundColor = heat > 0.1 ? 'var(--brand-sunset)' : '';
      }
    });
  }
})();
