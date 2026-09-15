# PreFrame Web

Web comercial de PreFrame, servida en GitHub Pages sobre `www.preframe-app.com`.

**HTML estático servido desde la raíz, y el deploy sigue siendo un push.** Lo
que hay en el repo es exactamente lo que sirve GitHub Pages: no hay Actions ni
paso de despliegue. `.nojekyll` evita el procesado Jekyll y `CNAME` fija el
dominio.

Lo único que cambió es de dónde SALEN cinco de esos HTML. Las páginas con
navegación existen en dos idiomas y su nav y su footer eran cinco copias a
mano, así que las genera Eleventy a partir de plantillas compartidas y
diccionarios de copy. Todo lo demás —legales, `/buy/*`, 404, assets— sigue
siendo estático puro y se edita a mano.

### Lo que es artefacto y lo que es fuente

**No editar a mano** (se regeneran y se sobrescriben):

```
/index.html            /es/index.html
/pricing/index.html    /es/pricing/index.html
/support/index.html    /es/support/index.html
/download/index.html   /es/download/index.html
/releases/index.html   /es/releases/index.html
/sitemap.xml
```

La fuente de esos diez HTML vive en `src/`:

```
src/_data/i18n/{en,es}/*.json   TODO el copy visible: cuerpo, títulos, alt,
                                aria-label, meta description, data-rail
src/_data/t.js                  carga los diccionarios → t[lang].home.hero…
src/_data/site.js               dominio e idiomas
src/_data/pages.js              las cinco páginas y sus rutas EN
src/_data/eleventyComputed.js   canonical, hreflang, langBase, altUrl, S, C
src/_includes/layouts/base.njk  el layout común
src/_includes/partials/         head, nav, footer, packs — partials ÚNICOS
src/_includes/pages/            UNA plantilla de contenido por página,
                                compartida entre los dos idiomas
src/en/*.njk, src/es/*.njk      stubs finos: clave de página + permalink
src/sitemap.njk                 el sitemap, con los hreflang cruzados
```

Regenerar:

```sh
npm install     # solo la primera vez
npm run build   # escribe los diez HTML y el sitemap en la RAÍZ
```

El build se commitea: es lo que sirve Pages. Eleventy no limpia el directorio
de salida, así que nunca borra nada de lo que ya hay en la raíz.

**Cambiar copy de esas páginas = editar un JSON de `src/_data/i18n/`, nunca el
HTML.** Si editas el HTML generado, el siguiente `npm run build` se lo lleva.

## Idiomas

Rutas por idioma, que es la práctica que entienden los buscadores en hosting
estático:

- Inglés en la raíz: `/`, `/pricing/`, `/support/`, `/download/`, `/releases/`.
  Ni una URL publicada cambió.
- Español bajo `/es/`: `/es/`, `/es/pricing/`, … con el mismo contenido.

Cada página lleva `hreflang` cruzado (`en`, `es`, `x-default` → inglés),
`canonical` propio y `og:locale` + `og:locale:alternate`. El conmutador de
idioma es **un enlace**, en el nav y en el footer: sin JavaScript, sin cookies
y sin `localStorage` — el idioma vive en la URL y no hay nada que recordar.

Los diccionarios de `src/_data/i18n/{en,es}/` están traducidos y tienen la
misma forma: mismas claves, mismo anidamiento y el mismo markup embebido en
cada valor. Cambiar copy es tocar los dos ficheros del namespace, nunca una
plantilla.

**Los mockups y las capturas van siempre en inglés**, en los dos idiomas: son
una foto del producto, no copy que se traduzca. Cubre el chrome del lienzo del
Mood Bar (`mood.chips`, `toolbar`, `curveLabel`, `shotType`…), el instrumento
del timeline (`instrument.lane`, `sections`, `mode*`, `readout`, `gap*`), la
etiqueta del widget solar y los rótulos de `assets/showcase.js`. Si cambias una
de esas claves, ponla igual en los dos ficheros.

Sí se traduce lo que rodea al mockup: títulos, ledes, listas de capacidades,
los `aria-label` que lo describen y los `stage-hint` que invitan a tocarlo —
un visitante español tiene que poder leer que puede arrastrar un keyframe.

Las capturas `.webp` de `assets/shots/` salen de la app real en inglés (ver
"Cómo se hacen las capturas").

Las páginas legales, `/buy/*` y la 404 no están traducidas: sus enlaces
apuntan al mismo sitio desde los dos idiomas, a propósito.

### Cómo se hacen las capturas

Las siete capturas con interfaz (`editor-full`, `ficha`, `gallery`, `export`,
`pdf-cover`, `pdf-shots`, `substrates`) las genera `tools/capture-shots.mjs` con Playwright
contra la app de verdad, sin retoques: el proyecto de demostración "Amanecer"
(`/editor/demo`: fotos reales, Mood Bar poblado, curva con etiquetas) y, para
el diálogo de exportación y las dos hojas del PDF (portada y página de planos,
recortadas del HTML de la vista previa a ancho de impresión), el demo "Neon
Pulse" (`/editor/1`), porque
"Amanecer" nace en preproducción y ahí EXPORT está deshabilitado a propósito.

```
# 1 · servidor de la app sin Supabase: sin backend no hay login y el demo carga solo
cd ../PreFrame && VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= npx vite --port 5199 --strictPort
# 2 · capturas → assets/shots/*.webp
node tools/capture-shots.mjs
```

Necesita Playwright con Chromium (`npx playwright@1.62 install chromium`
basta: el script lo busca en la caché de npx) y `cwebp` (`brew install webp`).
Ventana 1440×900 escalada a 2000×1250, idioma forzado a inglés vía
`localStorage` (`preframe:locale`), y se ocultan en el DOM los chips "DEMO" y
"no backend", que son del entorno y no de la app. Si cambia el tamaño de
alguna captura, actualizar `width`/`height` del `<img>` en
`src/_includes/pages/home.njk` y, si cambia lo que se ve, los `*.shotAlt` de
`src/_data/i18n/{en,es}/home.json`.

Los `photo-*.webp` son fotos de stock, sin interfaz: no hay que tocarlas.

## Estructura

```
/                  landing completa (hero animado + 12 secciones)   · generado
/download/         estado de la release — botones deshabilitados    · generado
/pricing/          el crédito en 3 pasos + precio fundador + FAQ    · generado
/support/          FAQ técnica (instalación, relink, audio-lock)    · generado
/releases/         notas de versión — vacío hasta la primera build  · generado
/es/…              las cinco anteriores en español                  · generado
/sitemap.xml       las diez URLs con hreflang cruzados              · generado
/404.html          página 404 brandeada
/legal/terms/      Términos de Servicio (borrador con placeholders)
/legal/privacy/    Política de Privacidad (borrador con placeholders)
/buy/success/      retorno de Stripe Checkout tras compra completada
/buy/cancel/       retorno de Stripe Checkout tras cancelación
```

## Assets

| Archivo | Qué es |
|---|---|
| `assets/theme.css` | **Copia íntegra** de `src/styles/theme.css` de la app. Fuente única de tokens. Sincronizar con `cp`, no editar aquí. |
| `assets/site.css` | Layout y componentes de la web. Añade solo los tokens que la app no tiene (lienzos claros, naranja entintado para texto sobre blanco, escala de marketing). |
| `assets/fonts.css` | `@font-face` de las fuentes autoalojadas. Copia de la de la app sin Poppins. |
| `assets/fonts/*.woff2` | Satoshi (400/500/700), Inter, JetBrains Mono y Fraunces. Copiadas de `src/assets/fonts/` de la app. |
| `assets/brand.js` | Constantes de marca y estado del producto (nombre, dominio, disponibilidad de descarga, precios). |
| `assets/timeline-data.js` | La forma del timeline: keyframes de la curva, keyframes etiquetados, ritmo del ciclo y silueta de la onda. **Fuente única** de las tres piezas que la dibujan. |
| `assets/site.js` | Comportamiento común: `data-brand`, CTA "Send this to your Mac", cola de analítica, año del footer. |
| `assets/hero.js` | Animación del timeline del hero (waveform ⇄ curva emocional), en DOM y SVG. |
| `assets/decor.js` | Visuales generados: mini-onda y mini-curva de los pilares, regla del cierre. |
| `assets/favicon.svg` | Icono de marca. |
| `assets/og-image.svg` | Diseño de la tarjeta social. Fuente del PNG. |
| `assets/og-image.png` | Export 1200×630 del SVG; es el que referencian los `og:image`. Si cambia el SVG, reexportar. |

### Sincronizar tokens con la app

```sh
cp ../PreFrame/src/styles/theme.css assets/theme.css
```

Trae at-rules de Tailwind (`@theme inline`, `@apply`) que el navegador ignora, y
capas `@layer` que pierden siempre frente a `site.css`. Es a propósito: así
sincronizar es un `cp` y no una traducción a mano — que es como se desincronizó
el `preframe.css` anterior.

## Tipografía

Satoshi (display) + Inter (cuerpo) + JetBrains Mono (datos técnicos: timecodes,
versión, tamaño de archivo, nombre del MP3). **Fraunces solo** en la nota
manuscrita del moodboard, donde representa texto tecleado por el usuario. No
usarla como voz de marca.

## Marca parametrizada

El nombre, el dominio y los precios viven en `assets/brand.js` y se inyectan en
los elementos con `data-brand="clave"`. Cada uno lleva su valor escrito en el
HTML como reserva, así que la web se lee entera sin JavaScript. Un rebrand se
hace ahí más un grep del literal en la prosa.

## Texto que vive en los JS

Lo que pinta JavaScript no puede salir del diccionario de Eleventy, así que
cada fichero lleva su propio diccionario inline y lee el idioma de
`document.documentElement.lang`. Sin fetch y sin almacenamiento, igual que el
resto.

| Archivo | Qué texto |
|---|---|
| `assets/site.js` | "Link copied" y el `shareData` de "Send this to your Mac" |
| `assets/hero.js` | `aria-label` de los keyframes arrastrables |
| `assets/motion.js` | `aria-label` del raíl de secciones |
| `assets/showcase.js` | rótulos de luz solar de la tarjeta de hora dorada |
| `assets/brand.js` | `price.founderLimit` y `download.mac.requirements` |

Los cinco están traducidos en los dos idiomas. Dos avisos si tocas esto:

- **`assets/showcase.js`**: sus rótulos replican los literales reales de la app
  (`windowLightLabel` en `solar.ts`), así que el español es el canónico y el
  inglés es la traducción, al revés que el resto del sitio.
- **`assets/brand.js`**: los valores que `site.js` inyecta en un `data-brand`
  pisan lo que hubiera en el HTML. Si un valor de `brand.js` es texto visible,
  tiene que ser `byLang` **y** coincidir con lo que dice el diccionario, o la
  página enseñará una cosa sin JavaScript y otra al hidratar.

## Previsualizar en local

Las rutas son absolutas (`/assets/...`), así que hay que servir el repo, no
abrir los archivos con `file://`:

```sh
npm run dev     # http://localhost:8080 — sirve la raíz y rehace al guardar
```

Sin Node a mano, cualquier servidor estático sobre la raíz vale (no reconstruye
las plantillas, sirve el último build commiteado):

```sh
python3 -m http.server 8080
# http://localhost:8080
```

## Privacidad

Un único origen externo: el beacon de **Cloudflare Web Analytics**
(`static.cloudflareinsights.com`, en `src/_includes/partials/head.njk`), que
mide páginas vistas sin cookies. Todo lo demás es autoalojado: fuentes propias,
sin Google Fonts, sin CDNs, sin más scripts de terceros. No se escriben cookies
ni `localStorage` — de eso depende que no haga falta banner de cookies. Si se
toca la analítica, no romper esa condición.

Las URLs de `/buy/*` se configuran en Supabase → Edge Functions → Secrets
(`CHECKOUT_SUCCESS_URL`, `CHECKOUT_CANCEL_URL`).
