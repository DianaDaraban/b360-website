"""Panel segmentation for the calculator photos.
Usage: python scripts/segment_panels.py <cut-out folder> public/calculator data/calculator-geometry.ts <review folder>
(cut-outs: cut-<body>.png and cut-top-<body>.png, background removed; needs scikit-image and opencv).
For each view: normalise the cut-out onto a 1600 x 640 canvas, build the paintable-body mask
(light, neutral pixels: no glass, tyres, dark trim, lamps), then grow one region per panel from a
seed point with a watershed over the panel-gap lines (dark thin lines + edges). Each region is
vectorised into an SVG path. Writes the images to public/calculator and the geometry to
data/calculator-geometry.ts, plus review overlays to the scratch folder."""
import json, sys
import numpy as np
import cv2
from PIL import Image
from skimage.segmentation import watershed
from skimage.filters import sobel
from skimage.morphology import black_tophat, disk
from smooth_outlines import smooth

SRC, OUT, DATA, REVIEW = sys.argv[1:5]
W, H = 1600, 640

# seed points per panel (canvas coordinates); "x" = not a panel (absorbs roof strips etc.)
SEEDS = {
    "sedan": {
        "side": {"bara-fata": [(95, 450)], "aripa-fata": [(330, 330), (250, 340)], "usa-fata": [(680, 420), (600, 330)],
                 "usa-spate": [(980, 420), (1000, 330)], "aripa-spate": [(1300, 330), (1250, 400)], "bara-spate": [(1495, 450)],
                 "oglinda": [(590, 268)], "x": [(900, 152), (1100, 162), (800, 538)]},
        "top": {"capota": [(430, 320)], "plafon": [(880, 320)], "portbagaj": [(1385, 320)]},
    },
    "hatchback": {
        "side": {"bara-fata": [(85, 440)], "aripa-fata": [(330, 320), (240, 330)], "usa-fata": [(700, 380), (620, 300)],
                 "usa-spate": [(1050, 380), (1000, 300)], "aripa-spate": [(1350, 330), (1300, 400)], "bara-spate": [(1510, 440)],
                 "oglinda": [(600, 222)], "x": [(900, 92), (1150, 98), (800, 521)]},
        "top": {"capota": [(380, 320)], "plafon": [(940, 320)], "portbagaj": [(1345, 320)]},
    },
    "break": {
        "side": {"bara-fata": [(110, 450)], "aripa-fata": [(330, 340), (250, 350)], "usa-fata": [(680, 420), (600, 340)],
                 "usa-spate": [(1000, 420), (980, 340)], "aripa-spate": [(1330, 340), (1280, 410)], "bara-spate": [(1505, 470)],
                 "oglinda": [(592, 262)], "x": [(900, 142), (1200, 150), (800, 537)]},
        "top": {"capota": [(340, 320)], "plafon": [(970, 320)], "portbagaj": [(1395, 320)]},
    },
    "suv": {
        "side": {"bara-fata": [(85, 440)], "aripa-fata": [(320, 290), (240, 320)], "usa-fata": [(690, 380), (620, 290)],
                 "usa-spate": [(1030, 380), (1000, 290)], "aripa-spate": [(1330, 300), (1300, 380)], "bara-spate": [(1505, 430)],
                 "oglinda": [(608, 192)], "x": [(900, 66), (1200, 72)]},
        "top": {"capota": [(350, 320)], "plafon": [(1150, 320)], "portbagaj": [(1385, 320)]},
    },
    "utilitara": {
        "side": {"bara-fata": [(140, 485)], "aripa-fata": [(265, 380)], "usa-fata": [(500, 420), (540, 330)],
                 "usa-culisanta": [(800, 400), (800, 200)], "panou-lateral": [(1180, 400), (1180, 200), (1200, 85)], "bara-spate": [(1450, 490)], "x": [(480, 75), (800, 538)]},
        "top": {"capota": [(225, 320)], "plafon": [(900, 320)]},
    },
}

def normalise(path, top):
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im).copy()
    # drop soft shadows the background removal kept
    a[..., 3] = np.where(a[..., 3] < 170, 0, a[..., 3])
    if top:
        # seen from above the car is symmetric about its long axis (the middle of the glass);
        # a shadow falls on one side only, so keep what is present on both sides
        lum = a[..., :3].astype(np.float32) @ np.array([0.299, 0.587, 0.114], np.float32) / 255
        glass = (a[..., 3] > 200) & (lum < 0.3)
        cy = int(round(np.median(np.where(glass)[0])))
        m = a[..., 3] > 0
        mir = np.zeros_like(m)
        for y in range(m.shape[0]):
            yy = 2 * cy - y
            if 0 <= yy < m.shape[0]: mir[y] = m[yy]
        a[..., 3] = np.where(m & mir, a[..., 3], 0)
    im = Image.fromarray(a)
    im = im.crop(Image.fromarray((a[..., 3] > 0).astype(np.uint8) * 255).getbbox())
    s = min(1500 / im.width, (560 if top else 580) / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    cv = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    x = (W - im.width) // 2
    y = (H - im.height) // 2 if top else 610 - im.height
    cv.paste(im, (x, y), im)
    return cv

def paint_mask(rgba):
    a = np.asarray(rgba).astype(np.float32) / 255
    rgb, alpha = a[..., :3], a[..., 3]
    mx, mn = rgb.max(-1), rgb.min(-1)
    lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    m = ((alpha > 0.6) & (lum > 0.55) & (sat < 0.25)).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    # small islands (badges, reflections inside glass) out
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 400: keep[lab == i] = 1
    return keep, lum, alpha

def belt_line(lum, alpha, paint):
    # lowest glass pixel per column in the upper part of the car = window line
    glass = (alpha > 0.6) & (lum < 0.45)
    ys = []
    for x in range(0, W, 25):
        col = np.where(glass[:340, x])[0]
        ys.append(int(col.max()) if len(col) > 8 else None)
    xs = [i for i, y in enumerate(ys) if y is not None]
    ys = list(np.interp(range(len(ys)), xs, [ys[i] for i in xs]))
    pts = [[i * 25, int(y) + 4] for i, y in enumerate(ys)]
    # smooth
    sm = []
    for i in range(len(pts)):
        win = [p[1] for p in pts[max(0, i - 4): i + 5]]
        sm.append([pts[i][0], int(np.median(win))])
    return sm[::2] + [[W, sm[-1][1]]]

def segment(name, view, rgba):
    paint, lum, alpha = paint_mask(rgba)
    seeds = SEEDS[name][view]
    labels = list(seeds.keys())
    markers = np.zeros((H, W), np.int32)
    for i, k in enumerate(labels, 1):
        for (x, y) in seeds[k]:
            cv2.circle(markers, (x, y), 6, i, -1)
    if view == "top":
        car = alpha > 0.6
        band = np.zeros_like(paint)
        for x in range(W):
            r = np.where(car[:, x])[0]
            if len(r) < 20: continue
            h = r.max() - r.min()
            band[int(r.min() + 0.16 * h): int(r.max() - 0.16 * h), x] = 1
        paint = paint * band
    markers[paint == 0] = 0
    # elevation: panel gaps are thin dark lines; add edge strength
    g = lum.astype(np.float32)
    elev = black_tophat(g, disk(4)) * 4 + sobel(g)
    lab = watershed(elev, markers, mask=paint.astype(bool))
    out = []
    for i, k in enumerate(labels, 1):
        if k == "x": continue
        m = (lab == i).astype(np.uint8)
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
        cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cs = [c for c in cs if cv2.contourArea(c) > 150]
        if not cs: continue
        d = ""
        for c in cs:
            ap = cv2.approxPolyDP(c, 1.2, True).reshape(-1, 2)
            d += "M" + " L".join(f"{p[0]},{p[1]}" for p in ap) + "Z"
        out.append([k, smooth(d)])
    return out, lab, labels, paint, lum, alpha

PALETTE = [(238, 51, 56), (46, 156, 202), (246, 166, 35), (123, 177, 82), (155, 89, 182), (52, 73, 94), (230, 126, 34), (26, 188, 156), (120, 120, 120)]
geo = {}
for name in SEEDS:
    geo[name] = {}
    for view in ("side", "top"):
        f = f"{SRC}/cut-{'top-' if view == 'top' else ''}{name}.png"
        rgba = normalise(f, view == "top")
        rgba.save(f"{OUT}/{name}-{view}.webp", quality=84, method=6)
        panels, lab, labels, paint, lum, alpha = segment(name, view, rgba)
        pm = Image.new("RGBA", (W, H), (255, 255, 255, 0)); pm.putalpha(Image.fromarray(paint * 255).filter(__import__("PIL.ImageFilter").ImageFilter.GaussianBlur(1)))
        pm.save(f"{OUT}/{name}-{view}-paint.webp", quality=70, method=4)
        entry = {"panels": panels}
        if view == "side": entry["belt"] = belt_line(lum, alpha, paint)
        geo[name][view] = entry
        # review overlay
        base = np.asarray(rgba.convert("RGB")).astype(np.float32)
        col = np.zeros_like(base)
        for i, k in enumerate(labels, 1):
            col[lab == i] = PALETTE[(i - 1) % len(PALETTE)] if k != "x" else (40, 40, 40)
        mix = np.where((lab > 0)[..., None], base * 0.45 + col * 0.55, base)
        img = Image.fromarray(mix.astype(np.uint8))
        dr = __import__("PIL.ImageDraw").ImageDraw.Draw(img)
        for k in labels:
            for (x, y) in SEEDS[name][view][k]:
                dr.ellipse((x - 6, y - 6, x + 6, y + 6), outline=(0, 0, 0), width=2); dr.text((x + 8, y - 6), k, fill=(0, 0, 0))
        if view == "side": dr.line([tuple(p) for p in entry["belt"]], fill=(0, 200, 0), width=3)
        img.save(f"{REVIEW}/seg-{name}-{view}.png")
        print(name, view, [p[0] for p in panels])

with open(DATA, "w", encoding="utf8") as fh:
    fh.write("// GENERATED by scripts/segment_panels.py: panel outlines traced on the\n")
    fh.write("// calculator photos by a watershed over the real panel gaps. Do not edit by hand.\n")
    fh.write("export const geometry = " + json.dumps(geo) + " as const\n")
