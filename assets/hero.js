/* ─────────────────────────────────────────────────────────────────────
   Preframe Web — el timeline del hero.

   No es una animación del producto: es el producto, reducido a lo esencial y
   funcionando dentro de la página. Se puede:

     · arrastrar los keyframes y ver cómo cambia la forma de la pieza,
     · rascar el timeline con el ratón o con las flechas,
     · reproducir y parar con la barra espaciadora,
     · cambiar de sustrato con 1 / 2 / 3.

   Mientras tanto, la lectura de la barra superior dice en tiempo real en qué
   timecode va, en qué sección cae y qué intensidad tiene ese instante. Y los
   planos del moodboard se encienden cuando el playhead entra en su rango,
   porque en esta herramienta un plano ocupa un trozo de tiempo.

   Esa es la tesis entera del producto y no hace falta un párrafo para
   contarla: se toca.

   Rendimiento: el bucle escribe `style` directamente sobre las refs y la
   curva se resuelve en `curve.js` sin tocar geometría del SVG, así que
   rehacerla mientras se arrastra un keyframe sale gratis.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var stage = document.querySelector('[data-hero-stage]');
  if (!stage || !window.PREFRAME_TIMELINE || !window.PreframeCurve) return;

  var DATA = window.PREFRAME_TIMELINE;

  var track = stage.querySelector('.track');
  var waveLayer = stage.querySelector('[data-wave-layer]');
  var curveLayer = stage.querySelector('[data-curve-layer]');
  var curveLine = stage.querySelector('[data-curve-line]');
  var curveFill = stage.querySelector('[data-curve-fill]');
  var playhead = stage.querySelector('[data-playhead]');
  var rider = stage.querySelector('[data-rider]');
  var kfHost = stage.querySelector('[data-kf-host]');
  var stageFile = stage.querySelector('[data-stage-file]');
  var readout = stage.querySelector('[data-readout]');
  var switchButtons = stage.querySelectorAll('[data-mode]');
  var sectionEls = stage.querySelectorAll('.sections .sec');
  var shotCards = stage.querySelectorAll('[data-shot-start]');

  if (!track || !waveLayer || !curveLine) return;

  var VIEW = { width: 1000, height: 124, pad: 10 };
  var SWEEP = DATA.timing.sweep;
  var HOLD = DATA.timing.hold;
  var DURATION = parseFloat(stage.getAttribute('data-duration')) || 221;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ═══════════════════════════════════════════════════════════════════
     1. SECCIONES — el reparto y los colores se leen del DOM, que es donde
     están escritos. Así no hay dos verdades.
     ═══════════════════════════════════════════════════════════════════ */

  var sections = Array.prototype.map.call(sectionEls, function (el) {
    var style = window.getComputedStyle(el);
    return {
      weight: parseFloat(style.flexGrow) || 1,
      color: style.borderTopColor,
      label: (el.textContent || '').trim(),
    };
  });

  var bounds = (function () {
    var total = sections.reduce(function (sum, s) { return sum + s.weight; }, 0) || 1;
    var acc = 0;
    return sections.map(function (s) { return (acc += s.weight / total); });
  })();

  function sectionAt(time) {
    for (var i = 0; i < bounds.length; i++) if (time < bounds[i]) return sections[i];
    return sections[sections.length - 1] || { color: 'currentColor', label: '' };
  }

  /* ═══════════════════════════════════════════════════════════════════
     2. WAVEFORM
     ═══════════════════════════════════════════════════════════════════ */

  var bars = [];
  var barAmps = [];

  function buildBars() {
    /* ~6px por barra: 150 en escritorio, ~55 en un móvil estrecho. */
    var count = Math.max(48, Math.min(150, Math.round((track.clientWidth || 900) / 6)));
    if (count === bars.length) return;

    var fragment = document.createDocumentFragment();
    bars = [];
    barAmps = [];

    for (var i = 0; i < count; i++) {
      var bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.backgroundColor = sectionAt(i / count).color;
      fragment.appendChild(bar);
      bars.push(bar);
      barAmps.push(DATA.amplitudeAt(i, count));
    }

    waveLayer.textContent = '';
    waveLayer.appendChild(fragment);
    sizeBars();
  }

  function sizeBars() {
    var height = track.clientHeight;
    for (var i = 0; i < bars.length; i++) {
      bars[i].style.height = Math.max(5, barAmps[i] * (height - 16)) + 'px';
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     3. CURVA — con copia propia y editable de los keyframes
     ═══════════════════════════════════════════════════════════════════ */

  /* Copia local: lo que el visitante dibuje aquí no altera la curva canónica
     que consumen los pilares de más abajo. */
  var keyframes = DATA.keyframes.map(function (pair) { return [pair[0], pair[1]]; });
  var curve = window.PreframeCurve.build(keyframes);

  function redrawCurve() {
    var d = curve.path(VIEW);
    curveLine.setAttribute('d', d);
    if (curveFill) {
      curveFill.setAttribute('d', d + ' L ' + VIEW.width + ' ' + VIEW.height + ' L 0 ' + VIEW.height + ' Z');
    }
  }

  /** Altura en píxeles reales dentro de la pista, para lo que no es SVG. */
  function curveTop(time) {
    var height = track.clientHeight;
    var padding = (VIEW.pad / VIEW.height) * height;
    return height - padding - curve.valueAt(time) * (height - padding * 2);
  }

  /* Los keyframes etiquetados son los que se pueden agarrar. Cada uno apunta
     al índice que ocupa en el array editable. */
  var handles = DATA.marks.map(function (mark) {
    var index = -1;
    for (var i = 0; i < keyframes.length; i++) {
      if (Math.abs(keyframes[i][0] - mark.t) < 1e-6) { index = i; break; }
    }

    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'kf';
    dot.setAttribute('aria-label', mark.label + ' keyframe — drag, or use the up and down arrows, to change its intensity');

    var tag = document.createElement('span');
    tag.className = 'kf-tag';
    tag.textContent = mark.label;

    kfHost.appendChild(dot);
    kfHost.appendChild(tag);
    return { t: mark.t, index: index, label: mark.label, dot: dot, tag: tag };
  }).filter(function (handle) { return handle.index >= 0; });

  function placeHandles() {
    for (var i = 0; i < handles.length; i++) {
      var handle = handles[i];
      var top = curveTop(handle.t) + 'px';
      var left = (handle.t * 100) + '%';
      handle.dot.style.left = left;
      handle.dot.style.top = top;
      handle.tag.style.left = left;
      handle.tag.style.top = top;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     4. LECTURA EN VIVO
     ═══════════════════════════════════════════════════════════════════ */

  function timecode(seconds) {
    var total = Math.max(0, Math.round(seconds));
    return Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0');
  }

  var lastReadout = '';

  function updateReadout() {
    if (!readout) return;
    var text = timecode(t * DURATION) +
      '  ' + (sectionAt(t).label || '').toUpperCase() +
      '  ' + Math.round(curve.valueAt(t) * 100) + '%';
    if (text === lastReadout) return;   /* el DOM solo se toca si cambia */
    lastReadout = text;
    readout.textContent = text;
  }

  function updateShots() {
    var seconds = t * DURATION;
    for (var i = 0; i < shotCards.length; i++) {
      var card = shotCards[i];
      var start = parseFloat(card.getAttribute('data-shot-start'));
      var end = parseFloat(card.getAttribute('data-shot-end'));
      card.classList.toggle('is-live', seconds >= start && seconds <= end);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     5. ESTADO Y PINTADO
     ═══════════════════════════════════════════════════════════════════ */

  var mode = 'wave';
  var auto = true;          /* el ciclo alterna de sustrato solo */
  var playing = false;
  var t = 0;
  var rafId = 0;
  var lastNow = 0;
  var holdUntil = 0;
  var visible = true;
  var dragging = null;

  function paintMode(next) {
    mode = next;
    Array.prototype.forEach.call(switchButtons, function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-mode') === next));
    });
    waveLayer.classList.toggle('is-off', next === 'curve');
    waveLayer.classList.toggle('is-dim', next === 'both');
    curveLayer.classList.toggle('is-off', next === 'wave');
    rider.classList.toggle('is-on', next !== 'wave');

    if (stageFile) {
      stageFile.textContent = next === 'curve'
        ? stageFile.getAttribute('data-label-notrack')
        : stageFile.getAttribute('data-label-track');
    }
    render();
  }

  /** Un único sitio escribe en el DOM del timeline. */
  function render() {
    var percent = (t * 100) + '%';
    playhead.style.left = percent;

    if (mode !== 'wave') {
      rider.style.left = percent;
      rider.style.top = curveTop(t) + 'px';
    }

    for (var i = 0; i < handles.length; i++) {
      var handle = handles[i];
      var near = mode !== 'wave' && t >= handle.t - 0.012 && t < handle.t + 0.1;
      handle.dot.classList.toggle('is-hot', near);
      handle.tag.classList.toggle('is-hot', near || dragging === handle);
    }

    if (mode !== 'curve') {
      var index = Math.floor(t * bars.length);
      for (var b = 0; b < bars.length; b++) {
        bars[b].style.opacity = b < index ? '0.3' : '0.6';
      }
    }

    track.setAttribute('aria-valuenow', Math.round(t * 100));
    track.setAttribute('aria-valuetext', timecode(t * DURATION));

    updateReadout();
    updateShots();
  }

  function frame(now) {
    rafId = window.requestAnimationFrame(frame);
    var dt = Math.min(now - lastNow, 50);
    lastNow = now;

    if (holdUntil) {
      if (now < holdUntil) return;
      holdUntil = 0;
      t = 0;
      if (auto) paintMode(mode === 'wave' ? 'curve' : 'wave');
    }

    t += dt / SWEEP;
    if (t >= 1) {
      t = 1;
      holdUntil = now + HOLD;
    }
    render();
  }

  function play() {
    if (playing) return;
    playing = true;
    stage.classList.add('is-playing');
    lastNow = window.performance.now();
    rafId = window.requestAnimationFrame(frame);
  }

  function pause() {
    if (!playing) return;
    playing = false;
    stage.classList.remove('is-playing');
    window.cancelAnimationFrame(rafId);
  }

  function togglePlay() {
    if (playing) { pause(); return; }
    holdUntil = 0;
    if (t >= 1) t = 0;
    play();
  }

  /* ═══════════════════════════════════════════════════════════════════
     6. INTERACCIÓN

     Todo lo que sigue existe para que esto se pueda tocar. Cualquier gesto
     manual detiene el ciclo automático: a partir de ahí manda el visitante.
     ═══════════════════════════════════════════════════════════════════ */

  function seekFromEvent(event) {
    var rect = track.getBoundingClientRect();
    t = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    holdUntil = 0;
    render();
  }

  /* ─── Rascar el timeline ────────────────────────────────────────────── */
  track.addEventListener('pointerdown', function (event) {
    if (event.target.closest('.kf')) return;    /* eso es arrastrar un keyframe */
    auto = false;
    pause();
    track.setPointerCapture(event.pointerId);
    stage.classList.add('is-scrubbing');
    seekFromEvent(event);
  });

  track.addEventListener('pointermove', function (event) {
    if (!track.hasPointerCapture(event.pointerId)) return;
    seekFromEvent(event);
  });

  function endScrub(event) {
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    stage.classList.remove('is-scrubbing');
  }
  track.addEventListener('pointerup', endScrub);
  track.addEventListener('pointercancel', endScrub);

  /* ─── Arrastrar keyframes ───────────────────────────────────────────── */
  function setHandleValue(handle, value) {
    keyframes[handle.index][1] = Math.max(0.04, Math.min(1, value));
    /* Rehacer la curva entera en cada movimiento: son ~256 evaluaciones de un
       polinomio, más barato que un reflow. */
    curve = window.PreframeCurve.build(keyframes);
    redrawCurve();
    placeHandles();
    render();
  }

  handles.forEach(function (handle) {
    handle.dot.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      event.stopPropagation();
      auto = false;
      pause();
      dragging = handle;
      handle.dot.setPointerCapture(event.pointerId);
      handle.dot.classList.add('is-dragging');
      /* Si se estaba viendo el waveform, se enseña la curva para que el gesto
         tenga sentido visual. */
      if (mode === 'wave') paintMode('both');
    });

    handle.dot.addEventListener('pointermove', function (event) {
      if (dragging !== handle) return;
      var rect = track.getBoundingClientRect();
      var padding = (VIEW.pad / VIEW.height) * rect.height;
      var usable = rect.height - padding * 2;
      setHandleValue(handle, 1 - (event.clientY - rect.top - padding) / usable);
    });

    var endDrag = function (event) {
      if (dragging !== handle) return;
      dragging = null;
      if (handle.dot.hasPointerCapture(event.pointerId)) {
        handle.dot.releasePointerCapture(event.pointerId);
      }
      handle.dot.classList.remove('is-dragging');
      render();
    };
    handle.dot.addEventListener('pointerup', endDrag);
    handle.dot.addEventListener('pointercancel', endDrag);

    /* Teclado: las flechas mueven la intensidad de cinco en cinco. */
    handle.dot.addEventListener('keydown', function (event) {
      var step = event.key === 'ArrowUp' ? 0.05 : event.key === 'ArrowDown' ? -0.05 : 0;
      if (!step) return;
      event.preventDefault();
      auto = false;
      if (mode === 'wave') paintMode('both');
      setHandleValue(handle, keyframes[handle.index][1] + step);
    });
  });

  /* ─── El rótulo "Drag a keyframe" es un atajo ───────────────────────
     Si se está viendo el waveform no hay keyframes que agarrar, así que
     pulsarlo lleva al sustrato donde sí los hay y deja el foco en el
     primero. Un rótulo que promete algo tiene que poder cumplirlo. */
  var hintEdit = stage.querySelector('[data-hint-edit]');
  if (hintEdit) {
    hintEdit.addEventListener('click', function () {
      auto = false;
      if (mode === 'wave') paintMode('both');
      if (handles.length) handles[0].dot.focus();
    });
  }

  /* ─── Teclado sobre el timeline ─────────────────────────────────────── */
  track.addEventListener('keydown', function (event) {
    var key = event.key;

    if (key === ' ' || key === 'Spacebar') {
      event.preventDefault();
      auto = false;
      togglePlay();
    } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      event.preventDefault();
      auto = false;
      pause();
      t = Math.max(0, Math.min(1, t + (key === 'ArrowRight' ? 0.02 : -0.02)));
      holdUntil = 0;
      render();
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault();
      pause();
      t = key === 'Home' ? 0 : 1;
      render();
    } else if (key === '1' || key === '2' || key === '3') {
      event.preventDefault();
      auto = false;
      paintMode(key === '1' ? 'wave' : key === '2' ? 'curve' : 'both');
    }
  });

  /* ─── Conmutador ────────────────────────────────────────────────────── */
  Array.prototype.forEach.call(switchButtons, function (btn) {
    btn.addEventListener('click', function () {
      auto = false;
      paintMode(btn.getAttribute('data-mode'));
      if (!playing && !prefersReduced.matches) play();
    });
  });

  /* ═══════════════════════════════════════════════════════════════════
     7. CICLO DE VIDA
     ═══════════════════════════════════════════════════════════════════ */

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      buildBars();
      sizeBars();
      placeHandles();
      render();
    }, 120);
  });

  if (window.IntersectionObserver) {
    new window.IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (!visible) pause();
      else if (auto && !prefersReduced.matches) play();
    }, { threshold: 0 }).observe(stage);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause();
    else if (visible && auto && !prefersReduced.matches) play();
  });

  if (prefersReduced.addEventListener) {
    prefersReduced.addEventListener('change', function () {
      if (prefersReduced.matches) pause();
      else if (visible && auto) play();
    });
  }

  /* ─── Arranque ──────────────────────────────────────────────────────── */
  buildBars();
  redrawCurve();
  placeHandles();
  paintMode('wave');

  if (prefersReduced.matches) {
    /* Sin reproducción automática, pero interactivo igual: pedir menos
       movimiento no es pedir una web muerta. */
    t = 0.34;
    render();
  } else {
    play();
  }
})();
