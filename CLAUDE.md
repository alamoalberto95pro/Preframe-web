# Preframe-web — Reglas para Claude Code

## Bitácora (`../Documentacion/bitacora/`)

Alberto quiere el porqué de cada decisión y el cierre de cada tarea en un
único sitio, enlazado a roadmaps y tablero.

- Cada decisión tomada o tarea cerrada se apunta en la nota diaria de ese
  día: `../Documentacion/bitacora/AAAA-MM-DD — Título.md`. Si no existe, se crea
  desde `../Documentacion/plantillas/bitacora-dia.md` (fecha, título corto,
  roadmaps tocados, tags `bitacora` y, si hay decisión, `decision`).
- **Preguntar siempre antes de escribir.** No escribir en la bitácora por
  iniciativa propia: proponerlo con algo como *"¿Meto en la bitácora de hoy lo
  que hemos trabajado?"* y esperar el OK.
- Cuándo proponerlo: en cuanto se vea que lo que estamos haciendo ha terminado
  o está terminando, y también si se acercan las 23:55 de ese día con cosas
  sin apuntar.
- Decisiones: qué, alternativas comparadas (lista con viñetas: una por opción,
  sangradas "A favor" / "En contra", ✅ en la elegida; nunca tabla), por qué
  esta y dónde queda.
- Tareas cerradas: línea `- [x] …` con la referencia `[[TABLERO#^id]]` de la
  tarjeta.
- **Cada bloque referencia su tarjeta del tablero** con una referencia de
  bloque: `Tablero: [[TABLERO#^id]]`. Si la tarjeta no tiene `^id`, añadirlo
  al final de su línea en `TABLERO.md` (convención: `^t<nº de issue>` si lo
  tiene, p. ej. `^t47`; si no, `^t-<palabra>`, p. ej. `^t-correo`). Nunca
  cambiar un `^id` existente. Ese añadido entra en el mismo OK que la entrada
  de bitácora; no hace falta pedirlo aparte.
- **Cada tarjeta enlaza su roadmap**: si la tarea pertenece a un roadmap, la
  línea de la tarjeta termina con `→ [[roadmaps/<carpeta>/<fichero>]]`. Al
  crear o cerrar una tarea desde la bitácora, comprobar que el enlace está y
  proponerlo si falta. Los roadmaps llevan al final un bloque "Trazabilidad"
  (Dataview) que lista sus tarjetas y sus días de bitácora.
- **Análisis externos** (ChatGPT, Claude, web…) se guardan en
  `../Documentacion/analisis/AAAA-MM-DD — Título.md` con su frontmatter (`tema`,
  `fuente`, `estado`, `decision`, `tarea`). Cuando una decisión de la bitácora
  se apoya en uno: `Basado en: [[analisis/…]]` en el bloque y rellenar
  `decision:` (y `tarea:` si hay tarjeta) en el análisis. Entra en el mismo OK.
