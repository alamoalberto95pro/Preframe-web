#!/usr/bin/env python3
"""
Genera la tarjeta social y los iconos de Preframe.

Este script ES el diseño: se dibuja con la paleta Cinema Sunset y con la
tipografía de marca real (Satoshi e Inter, convertidas al vuelo desde los
mismos .woff2 que sirve la web), y usa el mismo campo abstracto de la
landing — pulso y respiración. Así no hay dos diseños que mantener.

Uso:
    pip3 install --user Pillow fonttools brotli
    python3 tools/make-images.py

Genera en assets/: og-image.png (1200x630), apple-touch-icon.png (180),
icon-192.png e icon-512.png.
"""
import math
import os
import tempfile

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "assets", "fonts")
OUT = os.path.join(ROOT, "assets")

INK    = (8, 8, 8)
SUNSET = (232, 129, 74)
SEPIA  = (138, 122, 107)
TEXT   = (245, 243, 239)
TEXT_2 = (197, 191, 178)

_tmp = tempfile.mkdtemp()

def font(name, size):
    """Convierte el woff2 de marca a ttf una vez y lo cachea en temporal."""
    ttf = os.path.join(_tmp, name + ".ttf")
    if not os.path.exists(ttf):
        f = TTFont(os.path.join(FONTS, name + ".woff2"))
        f.flavor = None
        f.save(ttf)
    return ImageFont.truetype(ttf, size)

def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

def glow(size, center, radius, color, strength):
    """Resplandor de hora dorada. Se dibuja pequeño y se escala: barato, y
       una vez desenfocado no se nota la diferencia."""
    w, h = size
    small = Image.new("L", (w // 6, h // 6), 0)
    d = ImageDraw.Draw(small)
    cx, cy, r = center[0] / 6, center[1] / 6, radius / 6
    for i in range(46, 0, -1):
        t = i / 46
        d.ellipse([cx - r * t, cy - r * t * 0.72, cx + r * t, cy + r * t * 0.72],
                  fill=int(255 * strength * (1 - t) ** 1.9))
    mask = small.filter(ImageFilter.GaussianBlur(6)).resize((w, h), Image.LANCZOS)
    return Image.new("RGB", (w, h), color), mask

def mark(size):
    """Icono de marca: cuadrado redondeado con degradado y claqueta."""
    s = size * 4                      # 4x y se reduce: bordes limpios
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    grad = Image.new("RGB", (s, s))
    gd = ImageDraw.Draw(grad)
    for y in range(s):
        gd.line([(0, y), (s, y)], fill=lerp(SUNSET, SEPIA, y / s))
    rounded = Image.new("L", (s, s), 0)
    ImageDraw.Draw(rounded).rounded_rectangle([0, 0, s - 1, s - 1],
                                              radius=int(s * 0.22), fill=255)
    img.paste(grad, (0, 0), rounded)

    d = ImageDraw.Draw(img)
    w = max(2, int(s * 0.055))
    pad = s * 0.24
    x0, y0, x1, y1 = pad, pad, s - pad, s - pad
    d.rounded_rectangle([x0, y0, x1, y1], radius=int(s * 0.05), outline=TEXT, width=w)
    d.line([(x0 + (x1 - x0) * 0.24, y0), (x0 + (x1 - x0) * 0.24, y1)], fill=TEXT, width=w)
    d.line([(x0 + (x1 - x0) * 0.76, y0), (x0 + (x1 - x0) * 0.76, y1)], fill=TEXT, width=w)
    d.line([(x0, (y0 + y1) / 2), (x1, (y0 + y1) / 2)], fill=TEXT, width=w)
    for fy in (0.26, 0.74):
        yy = y0 + (y1 - y0) * fy
        d.line([(x0, yy), (x0 + (x1 - x0) * 0.24, yy)], fill=TEXT, width=w)
        d.line([(x1 - (x1 - x0) * 0.24, yy), (x1, yy)], fill=TEXT, width=w)
    return img.resize((size, size), Image.LANCZOS)

# ═══ Tarjeta social ════════════════════════════════════════════════════
W, H = 1200, 630
card = Image.new("RGB", (W, H), INK)
layer, mask = glow((W, H), (W * 0.5, -H * 0.15), W * 0.62, SUNSET, 0.30)
card.paste(layer, (0, 0), mask)
d = ImageDraw.Draw(card)

m = mark(72)
card.paste(m, (80, 70), m)
d.text((176, 84), "Preframe", font=font("satoshi-700", 54), fill=TEXT)

d.text((80, 214), "Think in rhythm.",  font=font("satoshi-700", 76), fill=TEXT)
d.text((80, 298), "Think in emotion.", font=font("satoshi-700", 76), fill=TEXT)
d.text((80, 382), "Then shoot it.",    font=font("satoshi-700", 76), fill=SUNSET)

d.text((80, 484), "Pre-production software for filmmakers · Coming soon for macOS",
       font=font("inter-latin", 23), fill=TEXT_2)

# El campo, con el mismo pulso y la misma respiración que la página. La
# amplitud está calculada para que la cresta NO toque el borde inferior.
BASE_Y, SPAN, COUNT, HEAD = 574, 46, 118, 0.62
for i in range(COUNT):
    x = i / (COUNT - 1)
    profile = 0.35 + 0.65 * (math.sin(x * math.pi) ** 0.75)
    dist = abs(x - HEAD)
    crest = math.exp(-(dist * dist) / 0.004)
    grain = 0.82 + 0.18 * math.sin(x * 37)
    height = max(4, profile * grain * (1 + crest * 0.85) * SPAN)
    px = 80 + x * (W - 160)
    d.rounded_rectangle([px - 2.5, BASE_Y - height / 2, px + 2.5, BASE_Y + height / 2],
                        radius=3, fill=lerp(SEPIA, SUNSET, min(1.0, crest)))

card.save(os.path.join(OUT, "og-image.png"), optimize=True)
print("og-image.png", card.size)

# ═══ Iconos ════════════════════════════════════════════════════════════
for name, size in [("apple-touch-icon.png", 180), ("icon-192.png", 192), ("icon-512.png", 512)]:
    icon = Image.new("RGB", (size, size), INK)
    mm = mark(size)
    icon.paste(mm, (0, 0), mm)
    icon.save(os.path.join(OUT, name), optimize=True)
    print(name, f"{size}x{size}")
