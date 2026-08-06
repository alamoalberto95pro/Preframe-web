/* ─────────────────────────────────────────────────────────────────────
   Preframe Web — la forma del timeline del hero, en un solo sitio.

   La curva emocional se dibuja en tres sitios distintos (el timeline 2D del
   hero, la escena 3D que lo sustituye cuando el equipo puede con ella, y el
   mini-visual del pilar "The emotional curve"). Antes cada uno llevaba su
   copia de los keyframes, que es la forma segura de que acaben siendo tres
   curvas distintas. Aquí está la única.
   ───────────────────────────────────────────────────────────────────── */

window.PREFRAME_TIMELINE = {
  /* Keyframes [tiempo, intensidad] en [0..1]. Los mismos que dibujaría un
     usuario: arranque bajo, respiro, subida, pico y caída. */
  keyframes: [
    [0, 0.18], [0.12, 0.30], [0.26, 0.46], [0.40, 0.38], [0.52, 0.72],
    [0.63, 0.88], [0.74, 0.55], [0.85, 0.80], [1, 0.22],
  ],

  /* Keyframes etiquetados: los que se encienden al pasar el playhead. */
  marks: [
    { t: 0.26, label: 'breathe' },
    { t: 0.52, label: 'build' },
    { t: 0.63, label: 'peak' },
    { t: 0.85, label: 'last look' },
  ],

  /* Ritmo del ciclo, en milisegundos. */
  timing: {
    sweep: 6500,   /* una pasada del playhead */
    hold: 900,     /* pausa al final antes de cambiar de sustrato */
    morph: 1400,   /* solo 3D: duración de la transformación onda ⇄ curva */
  },

  /* Silueta de la onda: envolvente + ruido determinista, para que el
     waveform tenga la misma forma en 2D y en 3D y en cada carga. */
  amplitudeAt: function (index, count) {
    var t = index / count;
    var envelope = 0.4 + 0.6 * Math.abs(Math.sin(t * Math.PI * 2.6));
    /* Congruencia lineal sembrada con el índice: mismo valor siempre, sin
       depender del orden en que se pidan las barras. */
    var s = (index * 9301 + 49297) % 233280;
    s = (s * 9301 + 49297) % 233280;
    return (0.25 + (s / 233280) * 0.75) * envelope;
  },
};
