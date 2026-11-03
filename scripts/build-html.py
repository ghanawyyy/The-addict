#!/usr/bin/env python3
"""Inline the vector logo into index.html as three stacked layers (The / ADDICT / flame).

Each part is its own small <svg>, so the browser can animate it on the graphics chip
(smooth intro, no redraw of the whole logo on every frame).
Layer positions live in styles.css (.logo-the / .logo-addict / .logo-flame) and match
the bounding boxes printed below. Re-check them only if logo.svg ever changes.

Usage: python3 scripts/build-html.py
Reads scripts/index.template.html + public/assets/img/logo.svg -> writes public/index.html
"""
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
template = (root / "scripts" / "index.template.html").read_text(encoding="utf-8")
logo = (root / "public" / "assets" / "img" / "logo.svg").read_text(encoding="utf-8")

W, H = map(float, re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', logo).groups())
parts = dict((cls, (fill, d)) for cls, fill, d in re.findall(
    r'<path class="(logo-[a-z]+)" fill="([^"]+)" fill-rule="evenodd" d="([^"]+)"', logo))

layers = []
for cls in ("logo-the", "logo-addict", "logo-flame"):
    fill, d = parts[cls]
    nums = list(map(float, re.findall(r"-?\d+(?:\.\d+)?", d)))
    xs, ys = nums[0::2], nums[1::2]
    x0, y0, x1, y1 = min(xs) - 2, min(ys) - 2, max(xs) + 2, max(ys) + 2
    print(f"{cls}: left {x0 / W * 100:.3f}%  top {y0 / H * 100:.3f}%  width {(x1 - x0) / W * 100:.3f}%")
    path_cls = ' class="logo-flame-path"' if cls == "logo-flame" else ""
    layers.append(
        f'<svg class="logo-layer {cls}" viewBox="{x0:g} {y0:g} {x1 - x0:g} {y1 - y0:g}" aria-hidden="true" focusable="false">'
        f'<path{path_cls} fill="{fill}" fill-rule="evenodd" d="{d}"/></svg>'
    )

stack = '<span class="logo-stack" aria-hidden="true">' + "".join(layers) + "</span>"
html = template.replace("<!--LOGO-->", "        " + stack)
(root / "public" / "index.html").write_text(html, encoding="utf-8")
print("wrote public/index.html", len(html), "bytes")
