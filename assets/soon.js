/* ─────────────────────────────────────────────────────────────────────
   Preframe Web — el campo que respira.

   Dos movimientos superpuestos, que son la promesa de la página dicha en
   geometría:

     · el PULSO: una onda corta que recorre el campo de izquierda a derecha
       y hace subir las barras a su paso — el ritmo,
     · la RESPIRACIÓN: una curva larga y lenta que sube y baja la altura
       general del campo — la emoción.

   Nada de esto enseña el producto: es abstracto a propósito. Es una web
   publicada y todavía no toca contar qué hace la aplicación.

   Barato de mover: un rAF que escribe `height` y `opacity` sobre 60-ish
   nodos y nada más. Se para al ocultar la pestaña y no arranca si se ha
   pedido menos movimiento.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var field = document.querySelector('[data-field]');
  if (!field) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Una barra cada ~14px, entre 28 y 96: suficiente para leerse como campo
     continuo en un móvil y en un monitor ancho. */
  function barCount() {
    return Math.max(28, Math.min(96, Math.round(window.innerWidth / 14)));
  }

  var bars = [];

  function build() {
    var count = barCount();
    if (count === bars.length) return;

    var fragment = document.createDocumentFragment();
    bars = [];
    for (var i = 0; i < count; i++) {
      var bar = document.createElement('i');
      fragment.appendChild(bar);
      bars.push(bar);
    }
    field.textContent = '';
    field.appendChild(fragment);
  }

  /* Perfil base del campo: alto en el centro, recogido en los extremos. Da
     forma de pieza —arranca bajo, crece, se va— sin ser un gráfico de nada. */
  function profile(x) {
    return 0.35 + 0.65 * Math.pow(Math.sin(x * Math.PI), 0.75);
  }

  function paint(time) {
    var height = field.clientHeight || 160;
    var count = bars.length;

    /* La respiración: un ciclo largo de once segundos. */
    var breath = 0.72 + 0.28 * Math.sin(time / 11000 * Math.PI * 2);
    /* El pulso: recorre el campo cada siete segundos. */
    var head = ((time % 7000) / 7000);

    for (var i = 0; i < count; i++) {
      var x = i / (count - 1);

      /* Distancia al pulso, tratada como circular para que no dé un salto
         cuando la cresta sale por un lado y vuelve a entrar por el otro. */
      var d = Math.abs(x - head);
      if (d > 0.5) d = 1 - d;
      var crest = Math.exp(-(d * d) / 0.004);

      /* Textura fina para que el campo no parezca una curva perfecta. */
      var grain = 0.82 + 0.18 * Math.sin(x * 37 + time / 900);

      var value = profile(x) * breath * grain * (1 + crest * 0.85);
      var bar = bars[i];
      bar.style.height = Math.max(4, value * height * 0.62) + 'px';
      bar.style.opacity = 0.28 + crest * 0.6 + value * 0.18;
      /* Solo la cresta se tiñe de naranja; el resto se queda en sepia. */
      bar.style.backgroundColor = crest > 0.05
        ? 'color-mix(in srgb, var(--brand-sunset) ' + Math.round(crest * 100) + '%, var(--brand-sepia))'
        : '';
    }
  }

  /* ─── Bucle ─────────────────────────────────────────────────────────── */

  var rafId = 0;
  var startedAt = 0;

  function frame(now) {
    rafId = window.requestAnimationFrame(frame);
    if (!startedAt) startedAt = now;
    paint(now - startedAt);
  }

  function start() {
    if (rafId || reduced.matches) return;
    rafId = window.requestAnimationFrame(frame);
  }

  function stop() {
    if (!rafId) return;
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      build();
      if (!rafId) paint(0);
    }, 150);
  });

  if (reduced.addEventListener) {
    reduced.addEventListener('change', function () {
      if (reduced.matches) { stop(); paint(2600); }
      else start();
    });
  }

  /* ─── Arranque ──────────────────────────────────────────────────────── */
  build();

  if (reduced.matches) {
    paint(2600);          /* una pose quieta, con la cresta a media pista */
  } else {
    start();
  }
})();
