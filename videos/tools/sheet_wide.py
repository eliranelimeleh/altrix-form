#!/usr/bin/env python3
"""Contact sheet of landscape review stills: tools/sheet_wide.py <id> <comma-list> <out.jpg> [cols]"""
import sys
from PIL import Image, ImageDraw
vid, fs, out = sys.argv[1], sys.argv[2].split(','), sys.argv[3]
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 3
w, h = 640, 360
rows = (len(fs) + cols - 1) // cols
sh = Image.new('RGB', (w * cols, h * rows))
d = ImageDraw.Draw(sh)
for k, f in enumerate(fs):
    x, y = (k % cols) * w, (k // cols) * h
    sh.paste(Image.open(f'build/{vid}/stills/{f}.jpg').resize((w, h)), (x, y))
    d.text((x + 6, y + 4), f, fill=(255, 255, 0))
sh.save(out, quality=88)
