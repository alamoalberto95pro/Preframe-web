/* ─────────────────────────────────────────────────────────────────────
   PreFrame Web — el instrumento de /beta/: waveform, curva y playhead.

   La onda es la de un mp3 de verdad: una silueta FIJA — la canónica de
   `timeline-data.js` (amplitudeAt), la misma forma que pinta la home — y
   el movimiento lo pone el playhead, no las barras (la misma decisión que
   el hero de la app, 02-sept-2026: fuera la vibración constante). Al paso
   del playhead las barras quedan «reproducidas» (se encienden hacia el
   naranja de marca) y la curva emocional se va dibujando encima; un ciclo
   de siete segundos.

   Nació como el «campo que respira» del coming soon (soon.js); el
   15-sept-2026 se rehízo como reproductor al montarse en /beta/.

   Solo actúa si hay [data-field] en la página. Barato: el rAF solo toca
   color y opacidad (las alturas se fijan una vez); se para al ocultar la
   pestaña y no arranca si se ha pedido menos movimiento.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var field = document.querySelector('[data-field]');
  if (!field) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ─── La curva emocional y el playhead ──────────────────────────────
     La curva es LA curva: los keyframes canónicos de timeline-data.js,
     suavizados a bezier. Se dibuja al paso del playhead (mismo reloj que
     enciende las barras). Si el script de datos no está, la onda funciona
     sola, como siempre. */

  var curvePath = document.querySelector('[data-curve]');
  var playhead = document.querySelector('[data-playhead]');
  var waveBox = curvePath ? curvePath.parentNode.parentNode : null; /* .beta-wave */

  if (curvePath && window.PREFRAME_TIMELINE) {
    var W = 1000, H = 200, PAD = 16;
    var pts = window.PREFRAME_TIMELINE.keyframes.map(function (k) {
      return [k[0] * W, PAD + (1 - k[1]) * (H - PAD * 2)];
    });
    /* Catmull-Rom → bezier: la misma mano suelta con la que se dibuja la
       curva en la app, sin esquinas. */
    var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (var k = 0; k < pts.length - 1; k++) {
      var p0 = pts[k > 0 ? k - 1 : 0];
      var p1 = pts[k];
      var p2 = pts[k + 1];
      var p3 = pts[k + 2 < pts.length ? k + 2 : k + 1];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += 'C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) +
           ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1) +
           ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    curvePath.setAttribute('d', d);
  }

  /* ─── La onda ───────────────────────────────────────────────────────
     Una barra cada ~14px, entre 28 y 96: suficiente para leerse como onda
     continua en un móvil y en un monitor ancho. */

  function barCount() {
    return Math.max(40, Math.min(140, Math.round(window.innerWidth / 9)));
  }

  var bars = [];

  /* La silueta del tema, como la de un mp3 de verdad: muchas barras
     cortas, algunas largas y transientes sueltos que sobresalen — los
     golpes — sobre una envolvente musical: arranque contenido, cuerpo,
     clímax pasado el centro y coda corta. Determinista (hash de seno, sin
     periodicidad visible): la misma onda en cada carga. */
  function rand(i, salt) {
    var t = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return t - Math.floor(t);
  }

  function amplitude(i, count) {
    var x = i / (count - 1);

    var env = 0.34
      + 0.50 * Math.pow(Math.sin(Math.PI * Math.pow(x, 1.18)), 1.05)
      + 0.16 * Math.sin(x * Math.PI * 2.2 + 0.6);
    env = Math.max(0.20, Math.min(1, env));

    var r1 = rand(i, 1);
    var r2 = rand(i, 2);

    /* Reparto real de un waveform: muchas cortas, pocas largas… */
    var v = 0.28 + 0.58 * Math.pow(r1, 1.4);
    /* …y el golpe que sobresale, más o menos una barra de cada ocho. */
    if (r2 > 0.87) v = 0.88 + 0.12 * r1;

    return Math.min(1, v * env + 0.05);
  }

  /* Alturas FIJAS, puestas una vez (y en cada resize): la forma del audio
     no cambia porque suene. Sin JavaScript posterior, esta silueta quieta
     es el estado final — también con "reducir movimiento". */
  function shape() {
    var height = field.clientHeight || 160;
    var count = bars.length;
    for (var i = 0; i < count; i++) {
      bars[i].style.height = Math.max(4, amplitude(i, count) * height * 0.92) + 'px';
      bars[i].style.opacity = 0.4;
    }
  }

  function build() {
    var count = barCount();
    if (count !== bars.length) {
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
    shape();
  }

  /* ─── El playhead: el único movimiento ──────────────────────────────
     Recorre el tema en siete segundos. Lo ya reproducido se queda
     encendido hacia el naranja de marca; el frente lleva un realce corto,
     como el cabezal de un reproductor. */

  function paint(time) {
    var head = (time % 7000) / 7000;
    var count = bars.length;

    for (var i = 0; i < count; i++) {
      var x = i / (count - 1);
      var d = x - head;
      var crest = Math.exp(-(d * d) / 0.0012);
      var played = x <= head;

      var bar = bars[i];
      bar.style.opacity = Math.min(1, (played ? 0.9 : 0.3) + crest * 0.1);
      bar.style.backgroundColor = (played || crest > 0.05)
        ? 'color-mix(in srgb, var(--brand-sunset) ' + Math.round(38 + crest * 62) + '%, var(--brand-sepia))'
        : '';
    }

    /* La curva se dibuja hasta donde va la reproducción, y el playhead lo
       marca: un ciclo que es el producto contado sin palabras. */
    if (curvePath) curvePath.style.strokeDashoffset = String(1 - head);
    if (playhead && waveBox) {
      playhead.style.opacity = '1';
      playhead.style.transform = 'translateX(' + (head * waveBox.clientWidth).toFixed(1) + 'px)';
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
    resizeTimer = window.setTimeout(build, 150);
  });

  if (reduced.addEventListener) {
    reduced.addEventListener('change', function () {
      if (reduced.matches) stop();
      else start();
    });
  }

  build();
  start();
})();
