#!/usr/bin/env python3
"""Contact sheet of review stills: tools/sheet.py <id> <comma-list> <out.jpg>"""
import sys
from PIL import Image
vid, fs, out = sys.argv[1], sys.argv[2].split(','), sys.argv[3]
w, h, cols = 320, 569, 6
rows = (len(fs) + cols - 1) // cols
sh = Image.new('RGB', (w * cols, h * rows))
for k, f in enumerate(fs):
    sh.paste(Image.open(f'build/{vid}/stills/{f}.jpg').resize((w, h)), ((k % cols) * w, (k // cols) * h))
sh.save(out, quality=85)
