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

  var win = document.querySelector('[data-sun-win]');
  var winLabel = document.querySelector('[data-sun-winlabel]');
  var rowKey = document.querySelector('[data-sun-rowkey]');
  var rowVal = document.querySelector('[data-sun-rowval]');
  var cursor = document.querySelector('[data-sun-cursor]');
  var bar = document.querySelector('[data-sunbar]');
  if (!win || !bar || !cursor) return;

  var reduced2 = window.matchMedia('(prefers-reduced-motion: reduce)');
  var WIN_W = 22;          /* ancho de la ventana, en % de la barra */
  var HOME = 56;           /* posición de reposo: la golden hour de la tarde */

  /* Franjas del día alineadas con el degradado de la barra. Se evalúan en el
     CENTRO de la ventana.

     Los rótulos van SIEMPRE en inglés, en los dos idiomas de la web: son
     una réplica de la tira solar de la app, y los mockups y capturas se
     enseñan en inglés (decisión de Alberto, 2026-08-14). Se corresponden con
     `windowLightLabel` (solar.ts) con la app en inglés. */
  var COPY = {
    night: 'Night',
    blueHour: 'Blue hour',
    morning: 'Morning light',
    afternoon: 'Afternoon light',
    goldenHour: 'Golden hour',
  };

  var BANDS = [
    [0.13, COPY.night],
    [0.30, COPY.blueHour],
    [0.50, COPY.morning],
    [0.62, COPY.afternoon],
    [0.80, COPY.goldenHour],
    [0.90, COPY.blueHour],
    [1.01, COPY.night],
  ];
  function labelAt(t) {
    for (var i = 0; i < BANDS.length; i++) if (t < BANDS[i][0]) return BANDS[i][1];
    return COPY.night;
  }
  function fmtHour(t) {
    var minutes = Math.round(t * 24 * 60);
    var h = Math.floor(minutes / 60) % 24;
    var m = minutes % 60;
    return h + ':' + String(m).padStart(2, '0');
  }

  var lastLabel = '';
  function setWindow(leftPct) {
    win.style.left = leftPct + '%';
    var center = (leftPct + WIN_W / 2) / 100;
    var label = labelAt(center);
    if (label !== lastLabel && winLabel) {
      lastLabel = label;
      winLabel.textContent = label;
      winLabel.classList.remove('is-pop');
      void winLabel.offsetWidth;
      winLabel.classList.add('is-pop');
    }
    if (rowKey) rowKey.textContent = label;
    if (rowVal) rowVal.textContent = fmtHour(leftPct / 100) + ' → ' + fmtHour((leftPct + WIN_W) / 100);
  }

  if (reduced2.matches || !window.IntersectionObserver) {
    setWindow(HOME);
    cursor.style.display = 'none';
    return;
  }

  /* ─── Coreografía: el fantasma agarra la ventana y la pasea ─────────── */
  var host = bar.closest('.bento-visual') || bar.parentElement;
  var alive = true;
  var visible = false;
  var running = false;

  function wait(ms) { return new Promise(function (r) { window.setTimeout(r, ms); }); }

  function cursorTo(x, y, ms) {
    return new Promise(function (resolve) {
      var st = window.getComputedStyle(cursor);
      var m = new DOMMatrixReadOnly(st.transform === 'none' ? '' : st.transform);
      var x0 = m.m41, y0 = m.m42;
      var t0 = window.performance.now();
      (function step(now) {
        if (!alive) return resolve();
        var p = Math.min(1, (now - t0) / ms);
        var e = 1 - Math.pow(1 - p, 3);
        cursor.style.transform = 'translate(' + (x0 + (x - x0) * e) + 'px,' + (y0 + (y - y0) * e) + 'px)';
        if (p < 1) window.requestAnimationFrame(step);
        else resolve();
      })(window.performance.now());
    });
  }

  /** Punto (px relativo al host) del centro de la ventana en leftPct. */
  function winPoint(leftPct) {
    var hostR = host.getBoundingClientRect();
    var barR = bar.getBoundingClientRect();
    return {
      x: barR.left - hostR.left + barR.width * (leftPct + WIN_W / 2) / 100,
      y: barR.top - hostR.top + barR.height / 2,
    };
  }

  /** Arrastra la ventana de a% a b%, con el cursor pegado a ella. */
  function dragWindow(fromPct, toPct, ms) {
    return new Promise(function (resolve) {
      var t0 = window.performance.now();
      (function step(now) {
        if (!alive) return resolve();
        var p = Math.min(1, (now - t0) / ms);
        var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        var left = fromPct + (toPct - fromPct) * e;
        setWindow(left);
        var pt = winPoint(left);
        cursor.style.transform = 'translate(' + pt.x + 'px,' + pt.y + 'px)';
        if (p < 1) window.requestAnimationFrame(step);
        else resolve();
      })(window.performance.now());
    });
  }

  async function performLoop() {
    if (running) return;
    running = true;
    var pos = HOME;
    setWindow(pos);

    while (alive && visible) {
      /* aparece lejos, llega a la ventana, la agarra */
      var start = winPoint(pos);
      cursor.style.transform = 'translate(' + (start.x - 130) + 'px,' + (start.y + 70) + 'px)';
      cursor.classList.add('is-on');
      await cursorTo(start.x, start.y, 750); if (!alive || !visible) break;
      cursor.classList.add('is-down');
      await wait(200);

      /* paseo: amanecer → mañana → vuelta a la golden de la tarde */
      await dragWindow(pos, 4, 2000); pos = 4; if (!alive || !visible) break;
      await wait(650);
      await dragWindow(pos, 33, 1500); pos = 33; if (!alive || !visible) break;
      await wait(650);
      await dragWindow(pos, HOME, 1700); pos = HOME; if (!alive || !visible) break;

      /* suelta y se retira */
      cursor.classList.remove('is-down');
      await wait(250);
      await cursorTo(winPoint(pos).x + 120, winPoint(pos).y + 80, 650);
      cursor.classList.remove('is-on');
      await wait(1600);
    }
    running = false;
  }

  new window.IntersectionObserver(function (entries) {
    visible = entries[0].intersectionRatio > 0.4;
    if (visible) performLoop();
  }, { threshold: [0, 0.4, 1] }).observe(host);

  if (reduced2.addEventListener) {
    reduced2.addEventListener('change', function () {
      if (!reduced2.matches) return;
      alive = false;
      cursor.style.display = 'none';
      setWindow(HOME);
    });
  }
})();
