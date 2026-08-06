# Preframe Web

Web comercial de Preframe, servida en GitHub Pages sobre `www.preframe-app.com`.

**HTML estático, sin build.** No hay `package.json` ni bundler: lo que hay en el
repo es exactamente lo que sirve GitHub Pages. `.nojekyll` evita el procesado
Jekyll y `CNAME` fija el dominio.

## Estructura

```
/                  landing completa (hero animado + 10 secciones)
/download/         estado de la release — botones deshabilitados, sin URL inventada
/pricing/          el crédito explicado en 3 pasos + precio fundador + FAQ
/support/          FAQ técnica (instalación, relink de audio, audio-lock, datos)
/releases/         notas de versión — vacío hasta la primera build firmada
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
| `assets/og-image.svg` | Diseño de la tarjeta social. **Falta exportarlo a PNG 1200×630.** |

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

## Previsualizar en local

Las rutas son absolutas (`/assets/...`), así que hay que servir el repo, no
abrir los archivos con `file://`:

```sh
python3 -m http.server 8080
# http://localhost:8080
```

## Privacidad

Cero orígenes externos: fuentes autoalojadas, sin Google Fonts, sin CDNs, sin
scripts de terceros. No se escriben cookies ni `localStorage` — de eso depende
que no haga falta banner de cookies. Al conectar la analítica sin cookies, no
romper esa condición.

Las URLs de `/buy/*` se configuran en Supabase → Edge Functions → Secrets
(`CHECKOUT_SUCCESS_URL`, `CHECKOUT_CANCEL_URL`).
