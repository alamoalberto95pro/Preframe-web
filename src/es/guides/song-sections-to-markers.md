---
guide: song-sections-to-markers
title: "Cómo llevar las secciones de una canción a Premiere, DaVinci Resolve o Final Cut como marcadores"
description: "Ya sabes dónde acaba la intro y dónde entra el estribillo. Así se llevan esos puntos a la línea de tiempo del editor como marcadores: a mano, o con un archivo que tu editor importa."
date: 2026-09-17
minutes: 7
order: 1
image: /assets/guides/song-sections-to-markers/og.png
ogImageAlt: "La forma de onda de una canción cortada en seis secciones con nombre en el timeline de PreFrame."
---
Cuando montas con música, el montaje está decidido antes de abrir el editor. La canción ya tiene una forma: una intro que se contiene, una subida, el momento en que todo se abre, una salida. Si planificaste tus planos contra esa forma, lo primero que quieres en una línea de tiempo vacía es esa forma: un marcador donde empieza cada sección, con su nombre.

Casi todo el mundo la reconstruye de oído: reproduces el tema, pulsas `M` cuando toca, ajustas, renombras. Funciona. También es la tercera vez que encuentras esos mismos puntos: una al planificar, otra al rodar y otra ahora.

Esta guía cubre las dos formas: hacerlo a mano bien hecho, e importar las secciones con un archivo. Cada uno de los tres grandes editores quiere una cosa distinta, y ahí es donde la gente se atasca.

## Lo primero: las secciones, en segundos

Vayas por donde vayas, partes de una lista corta: el nombre de cada sección y el segundo en que empieza.

<div class="callout">

| Sección | Empieza | Acaba |
|---|---|---|
| Silencio | 0:00 | 0:19 |
| Despertar | 0:19 | 0:39 |
| La carrera | 0:39 | 1:00 |
| El puente | 1:00 | 1:29 |
| Amanecer | 1:29 | 1:58 |
| Título | 1:58 | 2:04 |

</div>

Es un plan real para un vídeo de dos minutos. Si todavía no tienes el tuyo, [cómo partir una canción en secciones narrativas]({{ langBase }}/guides/cut-a-song-into-sections/) te lo deja hecho en una escucha y media.

<figure>
<img src="/assets/guides/song-sections-to-markers/timeline-sections.png" alt="La forma de onda de una canción cortada en seis secciones con nombre: Silence, Waking up, The run, The bridge, Dawn y Title." width="1600" height="412" loading="lazy">
<figcaption>Las mismas seis secciones, cortadas sobre la forma de onda. Las líneas de corte son los marcadores que quieres en tu editor.</figcaption>
</figure>

## A mano (sirve en cualquier editor)

1. **Decide los fotogramas por segundo antes que nada.** Los marcadores viven en fotogramas, no en segundos. Una secuencia a 25 fps y una lista hecha para 24 se van separando, y lo notarás al final de la canción, que es donde más duele.
2. **Pasa cada inicio a código de tiempo.** Los segundos siguen siendo segundos; solo cambia el último par. `0:19` es `00:00:19:00`. Un corte en 19,5 s es `00:00:19:12` a 25 fps (medio segundo son 12,5 fotogramas: redondea, y hazlo siempre igual).
3. **Pon la canción en la línea de tiempo primero**, empezando justo al principio de la secuencia. Todos los marcadores se miden desde ahí; si luego el tema se desplaza, todos quedan mal por la misma cantidad.
4. **Ve a cada código de tiempo y pulsa `M`.** En los tres editores puedes teclear un código de tiempo para saltar con el cabezal. Un `M` pone el marcador; otro `M` (Premiere, Final Cut) o doble clic (Resolve) te deja ponerle nombre.
5. **Nómbralo como el plan**, no como la canción. «Estribillo 2» no te dice nada a la una de la madrugada. «El puente — por fin se encuentran» te dice qué material va ahí.

Seis marcadores son cinco minutos. Cuarenta —uno por plano planificado— son una tarde, y ese es el punto en que un archivo empieza a tener sentido.

## Importando: cada editor quiere un archivo distinto

No existe un único «archivo de marcadores» que lean los tres. Esto es lo que acepta cada uno de verdad:

| Editor | Archivo que importa como marcadores | Dónde aparecen |
|---|---|---|
| DaVinci Resolve | EDL (`.edl`) | En la línea de tiempo que elijas |
| Premiere Pro | XML de Final Cut 7 (`.xml`) | En una secuencia nueva |
| Final Cut Pro | FCPXML (`.fcpxml`) | En un proyecto nuevo, dentro de un evento |

Dos trampas que conviene conocer antes de perder una hora:

- **Premiere no convierte un EDL en marcadores.** Lo importa como lista de cortes y te deja clips sin conexión. Los marcadores solo entran por XML.
- **Ninguno de estos archivos lleva tu material ni tu canción.** Son solo marcadores. El tema y los clips los pones tú después.

### DaVinci Resolve — EDL

Resolve sabe importar marcadores desde un EDL, y es el más sencillo de los tres porque el formato es texto plano. Así se ven dos de las secciones de arriba:

```
TITLE: Dawn
FCM: NON-DROP FRAME

001  001      V     C        01:00:00:00 01:00:00:01 01:00:00:00 01:00:00:01  
 |C:ResolveColorRed |M:Silence |D:475

002  001      V     C        01:00:19:00 01:00:19:01 01:00:19:00 01:00:19:01  
 |C:ResolveColorRose |M:Waking up |D:500
```

`|M:` es el nombre del marcador, `|C:` su color y `|D:` su duración en fotogramas (19 segundos a 25 fps son 475).

Para importarlo: en el **Media Pool**, clic derecho sobre tu línea de tiempo → **Timelines → Import → Timeline Markers from EDL**, y eliges el archivo.

Tres cosas deciden si los marcadores llegan a verse:

- **El código de tiempo de inicio tiene que coincidir con el de tu línea de tiempo.** Las de Resolve empiezan por defecto en `01:00:00:00`, y por eso el ejemplo también. Si la tuya empieza en `00:00:00:00`, el archivo tiene que empezar igual; si no, la importación «funciona» y no ves nada.
- **Los fotogramas por segundo del proyecto tienen que coincidir** con los del archivo.
- **Solo ASCII.** Las tildes y los símbolos se pierden al importar. «Canción» llega roto; «Cancion» llega bien.

### Premiere Pro — XML

Premiere lee marcadores desde el XML de Final Cut 7, el mismo formato que escribe con *Archivo → Exportar → XML de Final Cut Pro*. No es algo que vayas a escribir a mano.

Para importarlo: **Archivo → Importar** y eliges el `.xml`. Aparece una secuencia nueva en el panel Proyecto, con un clip de relleno que lleva los marcadores.

A partir de ahí tienes dos opciones:

- **Montar en esa secuencia.** Sueltas la canción y el material; los marcadores ya están.
- **Pasar los marcadores a tu secuencia.** Activa **Marcadores → Copiar y pegar incluye marcadores de secuencia**, copia el clip de relleno, pégalo en tu secuencia y borra el clip. Los marcadores se quedan.

### Final Cut Pro — FCPXML

Para importarlo: **Archivo → Importar → XML** y eliges el `.fcpxml`. Aparece un evento nuevo con un proyecto dentro: un hueco en silencio con la duración de la canción, que sostiene los marcadores. Las secciones llegan como marcadores de capítulo, los planos como marcadores estándar, y las notas se ven en el **Índice de la línea de tiempo**.

Monta ahí, o copia el hueco a tu proyecto y construye encima.

## Lo mismo en PreFrame

PreFrame es de donde sale esa lista de secciones: sueltas el tema, lo cortas en secciones sobre la forma de onda y pones cada plano en segundos reales. Exportar los marcadores es el último paso de planificar, no un trabajo aparte.

En el editor, **Export** abre un único diálogo. En *Markers for your editor* eliges el editor y los fotogramas por segundo —24, 25 o 30— y escribe el archivo que ese editor entiende: `.edl` para Resolve, `.xml` para Premiere, `.fcpxml` para Final Cut.

<figure>
<img src="/assets/guides/song-sections-to-markers/export-premiere.png" alt="El diálogo de exportación de PreFrame con Premiere seleccionado, 25 fps y los pasos de importación para Premiere escritos debajo." width="856" height="673" loading="lazy">
<figcaption>Eliges editor y fotogramas por segundo. Los pasos de importación de ese editor están escritos ahí mismo.</figcaption>
</figure>

Para Resolve hay una decisión más, y es la que pilla a todo el mundo: el código de tiempo de inicio de *tu* línea de tiempo.

<figure>
<img src="/assets/guides/song-sections-to-markers/export-davinci.png" alt="El diálogo de exportación de PreFrame con DaVinci seleccionado, con las opciones de framerate y el inicio de timeline entre 01:00:00:00 y 00:00:00:00." width="856" height="776" loading="lazy">
<figcaption>Resolve empieza por defecto en 01:00:00:00. Si tu línea de tiempo empieza en cero, se dice aquí.</figcaption>
</figure>

Lo que va dentro del archivo:

- **Un marcador por sección**, con su nombre y con el color de la sección allí donde el editor conserva colores.
- **Un marcador por plano**, con el tipo de plano y tus notas en el comentario del marcador: en el montaje lees «Gran plano general, dron estático a 80 m» en el fotograma exacto para el que se pensó.
- **Un marcador por fotograma, siempre.** Los editores solo admiten uno; si una sección y su primer plano empiezan en el mismo fotograma, se funden en un único marcador en lugar de que uno desaparezca sin avisar.
- **Texto limpio para Resolve**: las tildes se quitan solas, porque Resolve las perdería igualmente.

El mismo diálogo genera también el plan de rodaje: un PDF imprimible con cada plano, su código de tiempo y el tiempo que todavía no has cubierto. Planificar, rodar y montar leen los mismos segundos. Cómo funcionan la exportación y el bloqueo del audio está explicado en [soporte]({{ langBase }}/support/).

## Antes de cerrar el editor

- Comprueba el **primer** y el **último** marcador contra la música. Si el primero está bien y el último llega tarde, los fotogramas por segundo no coinciden. Si los dos fallan por lo mismo, la canción no está al principio de la línea de tiempo —o, en Resolve, el código de tiempo de inicio no coincide.
- Bloquea la pista de música cuando los marcadores cuadren. Todo lo que cortes a partir de aquí cuelga de esos puntos.
