#!/usr/bin/env node
/**
 * Rehace las capturas de la app de `assets/shots/` (las siete con interfaz;
 * los `photo-*.webp` son fotos de stock y no se tocan).
 *
 * Las capturas salen de la app REAL, en inglés, sin backend y sin login:
 * con `VITE_SUPABASE_URL` vacío, `RequireAuth` deja pasar y `/editor/demo`
 * monta el proyecto de demostración "Amanecer" (fotos, Mood Bar poblado,
 * curva con etiquetas). El export y el PDF se capturan desde `/editor/1`
 * (demo "Neon Pulse"): el demo "Amanecer" nace en preproducción y ahí el
 * botón EXPORT está deshabilitado a propósito.
 *
 * Uso (dos terminales):
 *   # 1 · en el repo de la app, servidor sin Supabase
 *   cd ../PreFrame && VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= npx vite --port 5199 --strictPort
 *   # 2 · aquí
 *   node tools/capture-shots.mjs            # escribe en assets/shots/
 *   PREFRAME_URL=http://localhost:5173 node tools/capture-shots.mjs
 *
 * Requiere Playwright (chromium) resoluble desde este directorio o desde la
 * caché de npx (`npx playwright@1.62 install chromium` la deja ahí) y
 * `cwebp` (brew install webp).
 *
 * Geometría: ventana 1440×900 CSS a escala 2000/1440 → 2000×1250 px, la
 * misma de las capturas originales. El chip "DEMO" y el de "no backend" se
 * ocultan en el DOM antes de disparar: son ruido del entorno, no de la app.
 */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync, mkdtempSync, unlinkSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, 'assets', 'shots');
const BASE = process.env.PREFRAME_URL ?? 'http://localhost:5199';
const TMP = mkdtempSync(join(tmpdir(), 'preframe-shots-'));

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [ROOT];
  const npx = join(homedir(), '.npm', '_npx');
  if (existsSync(npx)) for (const d of readdirSync(npx)) candidates.push(join(npx, d));
  for (const dir of candidates) {
    try { return require(require.resolve('playwright', { paths: [dir] })); } catch { /* siguiente */ }
  }
  throw new Error('No encuentro Playwright: npm i -D playwright, o npx playwright@1.62 install chromium');
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2000 / 1440,
  colorScheme: 'dark',
});
await ctx.addInitScript(() => { localStorage.setItem('preframe:locale', 'en'); });
const page = await ctx.newPage();
page.setDefaultTimeout(10000);

const tidy = () => page.evaluate(() => {
  for (const el of document.querySelectorAll('span,div,button')) {
    const t = el.textContent.trim();
    if (el.childElementCount === 0 && (t === 'DEMO' || t === 'no backend')) {
      (el.closest('button') || el).style.display = 'none';
    }
  }
});

/** Dispara, convierte a webp y deja el resultado en assets/shots/. */
async function shoot(name, { locator, clip } = {}) {
  await tidy();
  await page.mouse.move(300, 150); // fuera de cualquier tarjeta: sin hover
  await page.waitForTimeout(500);
  const png = join(TMP, `${name}.png`);
  if (locator) await locator.screenshot({ path: png });
  else await page.screenshot({ path: png, clip });
  execFileSync('cwebp', ['-quiet', '-q', '82', png, '-o', join(OUT, `${name}.webp`)]);
  unlinkSync(png);
  console.log('✓', `${name}.webp`);
}

const readout = () => page.evaluate(() => {
  const m = document.body.innerText.match(/(\d+)%/g);
  return m ? parseInt(m[m.length - 1]) : null;
});

// Área visible del lienzo del Mood Bar expandido (CSS px): bajo los chips
// de sección y sobre la barra de herramientas.
const CANVAS = { x0: 722, y0: 160, x1: 1440, y1: 800 };
const clusterBounds = () => page.evaluate((R) => {
  let u = null;
  for (const el of document.querySelectorAll('img, p, h3, h4, span, svg')) {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    if (r.left < R.x0 || r.top < R.y0 || r.bottom > R.y1) continue;
    u = u ? { l: Math.min(u.l, r.left), t: Math.min(u.t, r.top), r: Math.max(u.r, r.right), b: Math.max(u.b, r.bottom) }
          : { l: r.left, t: r.top, r: r.right, b: r.bottom };
  }
  return u;
}, CANVAS);

// ─── editor-full · hero ───────────────────────────────────────────────
await page.goto(`${BASE}/editor/demo`, { waitUntil: 'load' });
await page.waitForTimeout(7000); // audio sintético + blobs del demo en IndexedDB

// El demo auto-encuadra al 40 % (todo cabe, nada se lee). Zoom con el puntero
// en el centro del cúmulo (ese punto no se mueve al hacer zoom) y luego
// desplazamiento al centro del área. Ctrl+rueda = zoom; rueda = pan.
{
  const u = await clusterBounds();
  const ux = (u.l + u.r) / 2, uy = (u.t + u.b) / 2;
  await page.mouse.move(ux, uy);
  await page.keyboard.down('Control');
  for (let i = 0; i < 2; i++) { await page.mouse.wheel(0, -32); await page.waitForTimeout(150); }
  await page.keyboard.up('Control');
  await page.waitForTimeout(600);
  const cx = (CANVAS.x0 + CANVAS.x1) / 2, cy = (CANVAS.y0 + CANVAS.y1) / 2;
  await page.mouse.wheel(-(cx - ux), -(cy - uy));
  await page.waitForTimeout(500);
  console.log('zoom del lienzo:', await readout(), '%');
}
await shoot('editor-full');

// ─── substrates · la tarjeta del timeline, con el Mood Bar expandido ──
// Con el panel abierto la tarjeta queda a ~2,5:1 (como la captura original);
// plegado sale panorámica (3,9:1) y en la landing se ve diminuta.
await page.evaluate(() => {
  let el = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Draw curve');
  while (el && el.getBoundingClientRect().height < 250) el = el.parentElement;
  if (el) el.setAttribute('data-capture', 'substrates');
});
await shoot('substrates', { locator: page.locator('[data-capture="substrates"]') });

// ─── gallery · modal "Add shot" → "Created in this project" ───────────
await page.getByRole('button', { name: /^Add shot$/ }).first().click();
await page.waitForTimeout(800);
await page.getByRole('tab', { name: /Created in this project/ }).click();
await page.waitForTimeout(1500);
{
  const box = await page.getByRole('dialog').first().boundingBox();
  // El borde superior del diálogo deja ver la barra de navegación: fuera.
  const top = 16;
  await shoot('gallery', { clip: { x: box.x, y: box.y + top, width: box.width, height: box.height - top } });
}
await page.keyboard.press('Escape');
await page.waitForTimeout(600);

// ─── ficha · vista Sheet (clara) con el Mood Bar plegado ─────────────
await page.getByRole('button', { name: 'Collapse Mood Bar' }).click();
await page.waitForTimeout(1000);
await page.getByRole('tab', { name: /^Sheet$/ }).click();
await page.waitForTimeout(2000);
await shoot('ficha');

// ─── export + pdf-shots · desde el demo "Neon Pulse" ─────────────────
await page.goto(`${BASE}/editor/1`, { waitUntil: 'load' });
await page.waitForTimeout(6000);
await page.locator('button:has-text("EXPORT")').first().click();
await page.waitForTimeout(1500);
await shoot('export', { locator: page.getByRole('dialog').first() });

await page.getByRole('button', { name: /Preview shooting plan/ }).click();
await page.waitForTimeout(7000);
{
  // El documento es HTML estático (srcdoc). Se carga aparte, a ancho de
  // impresión y con alto libre, para recortar dos "hojas" verticales:
  // la portada (cabecera, notas, onda, cifras) y una página de planos con
  // la fila UNCOVERED TIME. Misma escala en las dos.
  const frame = page.frames().find((f) => f !== page.mainFrame());
  const html = await frame.content();
  const doc = await ctx.newPage();
  await doc.setViewportSize({ width: 860, height: 1400 });
  await doc.setContent(html, { waitUntil: 'load' });
  await doc.waitForTimeout(1500);
  const total = await doc.evaluate(() => document.documentElement.scrollHeight);
  const png = (name) => join(TMP, `${name}.png`);
  // Borde superior (menos un margen) de la fila de cabecera de una sección.
  const topOf = (re) => doc.evaluate((src) => {
    const rx = new RegExp(src);
    const el = [...document.querySelectorAll('*')].find((e) => e.childElementCount <= 3 && rx.test(e.textContent.trim()));
    let n = el; while (n && n.getBoundingClientRect().width < 400) n = n.parentElement;
    return n ? Math.round(n.getBoundingClientRect().top + window.scrollY) : null;
  }, re);
  // Dos hojas de la misma altura: la portada acaba donde empieza la sección
  // 01 (todo el bloque oscuro); la página de planos arranca en la 02.
  const y1 = (await topOf('^0?1\\s*Intro')) ?? 960;
  const y2 = ((await topOf('^0?2\\s*Build 1')) ?? 1320) - 24;
  const SHEET = y1;
  for (const [name, y] of [['pdf-cover', 0], ['pdf-shots', y2]]) {
    await doc.screenshot({ path: png(name), clip: { x: 0, y, width: 860, height: Math.min(SHEET, total - y) }, fullPage: true });
    execFileSync('cwebp', ['-quiet', '-q', '82', png(name), '-o', join(OUT, `${name}.webp`)]); unlinkSync(png(name));
    console.log('✓', `${name}.webp`, `(y=${y}, alto=${SHEET})`);
  }
  await doc.close();
}

await browser.close();
console.log('Listo. Revisa width/height de <img> en src/_includes/pages/home.njk si cambió el tamaño.');
