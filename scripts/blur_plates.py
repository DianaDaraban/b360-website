"""Blurs the licence plates in the gallery photos shipped with the site (public/lucrari), in place.
Usage: python scripts/blur_plates.py <plates.json>
plates.json maps each photo (path under public/lucrari) to its plates as [x1, y1, x2, y2, score],
found with the same plate detector the admin uses (public/models/plates.onnx). Detections that are
not plates (wrap graphics, badges) are left out by hand in SKIP, by photo and position in its list.
The blur is the one the admin applies: the box grown a little, pixelated, then softened, with a
feathered edge so it sits in the photo."""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent / "public" / "lucrari"
SKIP = {
    "autocare/stb.webp": {0, 1},
    "autoutilitare/tiriac-auto-2.webp": {0},
    "autoutilitare/tiriac-auto-3.webp": {0},
    "camioane/lebada-luxury-2.webp": {1},
    "proiecte/horus-and/1.webp": {0},
    "proiecte/hc-dunarea-braila/3.webp": {0},
    "proiecte/mashy-moto/3.webp": {0},
    "speciale/drapper-1.webp": {0},
}

def blur_boxes(im: Image.Image, boxes) -> Image.Image:
    im = im.convert("RGB")
    out = im.copy()
    for x1, y1, x2, y2 in boxes:
        w, h = x2 - x1, y2 - y1
        g = max(4, int(0.18 * max(w, h)))                  # grow: plates' frames and shadows too
        b = (max(0, int(x1 - g)), max(0, int(y1 - g)), min(im.width, int(x2 + g)), min(im.height, int(y2 + g)))
        part = im.crop(b)
        px = max(2, part.width // 10)
        part = part.resize((px, max(1, part.height * px // part.width)), Image.BILINEAR).resize(part.size, Image.BILINEAR)
        part = part.filter(ImageFilter.GaussianBlur(max(2, min(part.size) // 6)))
        mask = Image.new("L", part.size, 0)
        inner = Image.new("L", (max(1, part.width - 2 * g // 2), max(1, part.height - 2 * g // 2)), 255)
        mask.paste(inner, (g // 2, g // 2))
        mask = mask.filter(ImageFilter.GaussianBlur(max(1, g // 3)))
        out.paste(part, b[:2], mask)
    return out

if __name__ == "__main__":
    plates = json.load(open(sys.argv[1]))
    n = 0
    for key, found in plates.items():
        rel = key.replace("\\", "/")
        skip = SKIP.get(rel, set())
        boxes = [p[:4] for i, p in enumerate(found) if i not in skip]
        if not boxes:
            continue
        f = ROOT / rel
        im = Image.open(f)
        blur_boxes(im, boxes).save(f, quality=86, method=6)
        n += len(boxes)
    print("blurred", n, "plates")
