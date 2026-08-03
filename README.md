# Preframe Web

Páginas estáticas de Preframe servidas en GitHub Pages (Roadmap 06 · paso 7).

## Estructura

- `/` — landing mínima (la landing completa crece aquí en la fase de espera de certs)
- `/buy/success/` — retorno de Stripe Checkout tras compra completada
- `/buy/cancel/` — retorno de Stripe Checkout tras cancelación
- `/legal/terms/` — Términos de Servicio (borrador con placeholders hasta publicar)
- `/legal/privacy/` — Política de Privacidad (borrador con placeholders hasta publicar)
- `assets/preframe.css` — hoja compartida; espejo de los design tokens de la app

`.nojekyll` evita el procesado Jekyll de GitHub Pages.

Las URLs de `/buy/*` se configuran en Supabase → Edge Functions → Secrets
(`CHECKOUT_SUCCESS_URL`, `CHECKOUT_CANCEL_URL`).
