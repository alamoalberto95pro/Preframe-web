/* ─────────────────────────────────────────────────────────────────────
   PreFrame Web — la curva emocional, resuelta en JavaScript puro.

   Antes esto se hacía pidiéndole al SVG `getPointAtLength()` unas cuantas
   cientas de veces. Funciona, pero es geometría del navegador: cuesta lo
   suficiente como para que no se pueda rehacer mientras alguien arrastra un
   keyframe. Y arrastrar keyframes es justo lo que tiene que poder hacerse.

   Así que la curva se evalúa aquí: cada tramo entre keyframes es una Bézier
   cúbica con los dos puntos de control a la misma X (la mitad del tramo),
   que es lo que da la forma de curva de intensidad — sale plana en los
   keyframes y no se pasa de largo. Se muestrea una vez a una tabla y se
   consulta por interpolación lineal.

   Coste de rehacerla entera: ~256 evaluaciones de un polinomio. Sale gratis
   dentro de un `pointermove`, que es de lo que se trata.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var SEGMENT_SAMPLES = 32;

  function bezier(p0, p1, p2, p3, t) {
    var u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  }

  /**
   * Construye la tabla de consulta de una curva.
   * @param {Array<[number, number]>} keyframes pares [tiempo, intensidad] en 0-1
   * @returns {{ valueAt: function(number): number, path: function(object): string }}
   */
  function build(keyframes) {
    var xs = [];
    var ys = [];

    for (var k = 0; k < keyframes.length - 1; k++) {
      var x0 = keyframes[k][0], y0 = keyframes[k][1];
      var x1 = keyframes[k + 1][0], y1 = keyframes[k + 1][1];
      var cx = (x0 + x1) / 2;

      for (var s = 0; s < SEGMENT_SAMPLES; s++) {
        var t = s / SEGMENT_SAMPLES;
        xs.push(bezier(x0, cx, cx, x1, t));
        ys.push(bezier(y0, y0, y1, y1, t));
      }
    }
    xs.push(keyframes[keyframes.length - 1][0]);
    ys.push(keyframes[keyframes.length - 1][1]);

    /* Búsqueda binaria + interpolación lineal. La X es creciente por
       construcción, así que esto es exacto y no depende del reparto de los
       keyframes — que es donde fallaba el muestreo por parámetro. */
    function valueAt(x) {
      var target = x < 0 ? 0 : x > 1 ? 1 : x;
      var low = 0;
      var high = xs.length - 1;

      while (high - low > 1) {
        var mid = (low + high) >> 1;
        if (xs[mid] <= target) low = mid;
        else high = mid;
      }

      var span = xs[high] - xs[low];
      var mix = span > 1e-9 ? (target - xs[low]) / span : 0;
      return ys[low] + (ys[high] - ys[low]) * mix;
    }

    /** Devuelve el atributo `d` del path en las coordenadas que se le pidan. */
    function path(view) {
      var toX = function (x) { return x * view.width; };
      var toY = function (y) { return view.height - view.pad - y * (view.height - view.pad * 2); };

      var d = 'M ' + toX(keyframes[0][0]).toFixed(2) + ' ' + toY(keyframes[0][1]).toFixed(2);
      for (var i = 0; i < keyframes.length - 1; i++) {
        var ax = keyframes[i][0], ay = keyframes[i][1];
        var bx = keyframes[i + 1][0], by = keyframes[i + 1][1];
        var cx = ((toX(ax) + toX(bx)) / 2).toFixed(2);
        d += ' C ' + cx + ' ' + toY(ay).toFixed(2) +
             ', ' + cx + ' ' + toY(by).toFixed(2) +
             ', ' + toX(bx).toFixed(2) + ' ' + toY(by).toFixed(2);
      }
      return d;
    }

    return { valueAt: valueAt, path: path, keyframes: keyframes };
  }

  window.PreframeCurve = { build: build };
})();
