/* ─────────────────────────────────────────────────────────────────────
   Preframe Web — el puntero de la curva emocional.

   En la ventana "sin canción" de DOS CAMINOS, un cursor coreografiado
   enseña el gesto central del sustrato: agarra un keyframe, lo mueve, y
   la curva entera le sigue. No es interactivo — la sección vende los dos
   caminos, no un juguete — pero el gesto se VE, que es lo que hace
   entender para qué sirve la curva.

   Autocontenido a propósito: lee los keyframes de los propios círculos
   del SVG (cx/cy), así que la geometría vive en un solo sitio (el HTML)
   y este archivo no puede desincronizarse de ella. Cada gesto es
   neto-cero: lo que sube, luego baja, y la curva queda como estaba.

   Solo corre con la ventana en pantalla y nunca con reduced-motion.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var host = document.querySelector('[data-curve-demo]');
  if (!host) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !window.IntersectionObserver) return;

  var svg = host.querySelector('svg');
  var line = host.querySelector('.curve-path');
  var fill = host.querySelector('.curve-fill');
  var dots = Array.prototype.slice.call(host.querySelectorAll('.duo-kf'));
  if (!svg || !line || !fill || dots.length < 4) return;

  /* ─── La geometría, leída del SVG ───────────────────────────────────
     y = 12 + (1 - v) * 126 en un viewBox de 1000×150; aquí solo hace
     falta el inverso para mover valores y volver a pintar. */
  var KF = dots.map(function (dot) {
    var y = +dot.getAttribute('cy');
    return { dot: dot, x: +dot.getAttribute('cx'), y: y, y0: y };
  });

  /** La pose declarada en el HTML, para volver a ella si el gesto se
      interrumpe a medias (scroll, reduced-motion). */
  function restore() {
    KF.forEach(function (kf) {
      kf.y = kf.y0;
      kf.dot.setAttribute('cy', kf.y0);
    });
    repaint();
  }

  function catmullPath(points) {
    var d = 'M' + points[0].x.toFixed(1) + ' ' + points[0].y.toFixed(1);
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[Math.max(0, i - 1)];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[Math.min(points.length - 1, i + 2)];
      d += 'C' + (p1.x + (p2.x - p0.x) / 6).toFixed(1) + ' ' + (p1.y + (p2.y - p0.y) / 6).toFixed(1) +
           ' ' + (p2.x - (p3.x - p1.x) / 6).toFixed(1) + ' ' + (p2.y - (p3.y - p1.y) / 6).toFixed(1) +
           ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
    }
    return d;
  }

  function repaint() {
    var d = catmullPath(KF);
    line.setAttribute('d', d);
    fill.setAttribute('d', d + 'L1000 150L0 150Z');
  }

  /* ─── El cursor ─────────────────────────────────────────────────────── */
  var cursor = document.createElement('div');
  cursor.className = 'demo-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 3l14 8-6.5 1.5L9 19z"/></svg>';
  host.appendChild(cursor);

  function place(x, y) {
    cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }

  /** Centro de un keyframe en px relativos al host. */
  function dotPoint(kf) {
    var h = host.getBoundingClientRect();
    var r = kf.dot.getBoundingClientRect();
    return { x: r.left - h.left + r.width / 2, y: r.top - h.top + r.height / 2 };
  }

  /* ─── Coreografía ───────────────────────────────────────────────────── */
  var alive = true;
  var visible = false;
  var running = false;
  var pos = { x: 0, y: 0 };

  function wait(ms) { return new Promise(function (r) { window.setTimeout(r, ms); }); }

  function moveTo(x, y, ms) {
    return new Promise(function (resolve) {
      var x0 = pos.x, y0 = pos.y;
      var t0 = window.performance.now();
      (function step(now) {
        if (!alive) return resolve();
        var p = Math.min(1, (now - t0) / ms);
        var e = 1 - Math.pow(1 - p, 3);
        pos.x = x0 + (x - x0) * e;
        pos.y = y0 + (y - y0) * e;
        place(pos.x, pos.y);
        if (p < 1) window.requestAnimationFrame(step);
        else resolve();
      })(window.performance.now());
    });
  }

  /** Mueve el keyframe i en vertical (dy en unidades del viewBox) y de
      vuelta lo deja donde el HTML lo declaró: gesto neto-cero. */
  function dragDot(i, dy, ms) {
    return new Promise(function (resolve) {
      var from = KF[i].y;
      /* La curva vive entre y=12 (clímax) e y=138 (reposo). */
      var to = Math.max(14, Math.min(136, from + dy));
      var t0 = window.performance.now();
      (function step(now) {
        if (!alive) return resolve();
        var p = Math.min(1, (now - t0) / ms);
        var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        KF[i].y = from + (to - from) * e;
        KF[i].dot.setAttribute('cy', KF[i].y.toFixed(1));
        repaint();
        var c = dotPoint(KF[i]);
        pos.x = c.x; pos.y = c.y;
        place(c.x, c.y);
        if (p < 1) window.requestAnimationFrame(step);
        else resolve();
      })(window.performance.now());
    });
  }

  function press() { cursor.classList.add('is-down'); return wait(180); }
  function release() { cursor.classList.remove('is-down'); return wait(140); }

  async function performLoop() {
    if (running) return;
    running = true;

    while (alive && visible) {
      /* Aparece desde dentro de la ventana, discreto. */
      var hostR = host.getBoundingClientRect();
      pos.x = hostR.width * 0.82;
      pos.y = hostR.height * 0.86;
      place(pos.x, pos.y);
      cursor.classList.add('is-on');

      /* 1 · Al valle del giro: subirlo — "quiero más intensidad aquí" —
             y devolverlo. */
      var turn = KF[6] || KF[KF.length - 2];
      var c = dotPoint(turn);
      await moveTo(c.x, c.y, 800); if (!alive || !visible) break;
      await press();
      await dragDot(6, -34, 900); if (!alive || !visible) break;
      await wait(550);
      await dragDot(6, 34, 750); if (!alive || !visible) break;
      await release();
      await wait(400);

      /* 2 · A la subida temprana: un empujón corto, y de vuelta. */
      c = dotPoint(KF[1]);
      await moveTo(c.x, c.y, 700); if (!alive || !visible) break;
      await press();
      await dragDot(1, -24, 750); if (!alive || !visible) break;
      await wait(450);
      await dragDot(1, 24, 620); if (!alive || !visible) break;
      await release();

      /* Se retira y respira antes de repetir. */
      await moveTo(hostR.width * 0.88, hostR.height * 0.82, 650);
      cursor.classList.remove('is-on');
      await wait(2200);
    }

    cursor.classList.remove('is-on');
    restore();
    running = false;
  }

  new window.IntersectionObserver(function (entries) {
    visible = entries[0].intersectionRatio > 0.5;
    if (visible && alive) performLoop();
  }, { threshold: [0, 0.5, 1] }).observe(host);

  if (reduced.addEventListener) {
    reduced.addEventListener('change', function () {
      if (!reduced.matches) return;
      alive = false;
      cursor.remove();
      restore();
    });
  }
})();
