#!/usr/bin/env python3
"""Inline the vector logo into index.html (so its flame can be animated).

Usage: python3 scripts/build-html.py
Reads scripts/index.template.html + public/assets/img/logo.svg -> writes public/index.html
"""
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
template = (root / "scripts" / "index.template.html").read_text(encoding="utf-8")
logo = (root / "public" / "assets" / "img" / "logo.svg").read_text(encoding="utf-8").strip()

# drop the standalone <title> and accessible name: the <h1> carries the text instead
logo = re.sub(r"<title>.*?</title>", "", logo)
logo = logo.replace(' role="img" aria-label="The Addict"', ' aria-hidden="true" focusable="false"')

html = template.replace("<!--LOGO-->", "        " + logo)
(root / "public" / "index.html").write_text(html, encoding="utf-8")
print("wrote public/index.html", len(html), "bytes")
