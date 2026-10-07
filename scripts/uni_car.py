"""Make the 'integral wrap' version of rally-side: body panels in one chameleon colour,
glass, wheels, lights and vents untouched. Coordinates are in the 1500x650 crop at (250,130).
Usage: python scripts/uni_car.py public/img/rally-side.webp out.webp, then crop both photos to
(0, 124, 2000, 850) as rally-side-studio.webp / rally-uni-studio.webp for components/CarCompare."""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
OX, OY = 250, 130
im = Image.open(src).convert("RGB")
W, H = im.size

def P(pts):
    return [(x + OX, y + OY) for x, y in pts]

mask = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(mask)
# generous outline; the real edge comes from the flat studio background below
d.polygon(P([(10, 560), (10, 420), (30, 350), (80, 310), (200, 270), (330, 255), (380, 245), (460, 190),
             (560, 135), (630, 110), (800, 95), (950, 100), (1100, 115), (1185, 130), (1255, 172), (1275, 200),
             (1300, 245), (1380, 270), (1460, 300), (1470, 480), (1440, 545), (1370, 560),
             (1060, 565), (450, 565), (150, 562)]), fill=255)
cut = lambda pts: d.polygon(P(pts), fill=0)
# glass and the black trim under it
cut([(395, 268), (470, 222), (560, 170), (625, 138), (640, 142), (570, 192), (480, 242), (420, 274)])
cut([(540, 292), (560, 240), (620, 185), (700, 150), (905, 140), (915, 272), (700, 287)])
cut([(945, 140), (1150, 150), (1245, 235), (1240, 252), (1100, 264), (945, 272)])
# lights, grille, vents
d.ellipse(P([(40, 345), (135, 400)]), fill=0)
d.rectangle(P([(40, 440), (130, 505)]), fill=0)
cut([(918, 436), (1000, 436), (1002, 514), (924, 514)])
cut([(1310, 250), (1360, 262), (1405, 290), (1418, 335), (1385, 338), (1330, 300), (1305, 270)])
# the gap between the rear wheel, mud flap and bumper (background the flood can't reach)
cut([(1318, 522), (1380, 522), (1380, 575), (1318, 575)])
# wheels and wheel wells
d.ellipse(P([(290 - 140, 498 - 140), (290 + 140, 498 + 140)]), fill=0)
d.ellipse(P([(1195 - 140, 498 - 140), (1195 + 140, 498 + 140)]), fill=0)
# studio background is a flat (235,235,235): flood it from the corners and keep the car only
bg = im.copy()
for seed in [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1), (OX + 5, OY + 5), (OX + 1495, OY + 300)]:
    ImageDraw.floodfill(bg, seed, (255, 0, 255), thresh=16)
car = Image.fromarray(((np.asarray(bg) != [255, 0, 255]).any(-1) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))
mask = Image.fromarray(np.minimum(np.asarray(mask), np.asarray(car))).filter(ImageFilter.GaussianBlur(1.4))
# no surface detail where printed text sat (race plate, small logos), so it can't ghost through
quiet = Image.new("L", (W, H), 255)
q = ImageDraw.Draw(quiet)
for box in [(460, 305, 675, 405), (375, 315, 455, 345), (30, 415, 65, 445), (30, 505, 70, 530), (1410, 390, 1440, 410)]:
    q.rectangle(P([box[:2], box[2:]]), fill=0)
quiet = np.asarray(quiet.filter(ImageFilter.GaussianBlur(4))).astype(np.float32) / 255

a = np.asarray(im).astype(np.float32) / 255
L = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
blur = np.asarray(Image.fromarray((L * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255
detail = np.clip(L - blur, -0.035, 0.035)

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
cx, cy = (xx - OX) / 1500, (yy - OY) / 650
# colour-shift vinyl: violet at the front, through blue-teal to green at the back, shifting with height too
t = np.clip(cx * 0.8 + cy * 0.25, 0, 1)[..., None]
stops = np.array([[0.36, 0.17, 0.55], [0.13, 0.42, 0.66], [0.12, 0.56, 0.52], [0.30, 0.62, 0.30]], dtype=np.float32)
seg = np.clip(t * (len(stops) - 1), 0, len(stops) - 1 - 1e-4)
i = seg.astype(int)[..., 0]
f = seg - i[..., None]
col = stops[i] * (1 - f) + stops[i + 1] * f
# light from above: the roof and shoulder catch it, the sills fall into shadow
shade = (1.12 - 0.45 * np.clip(cy, 0, 1))[..., None]
gloss = (0.28 * np.exp(-((cy - 0.27) ** 2) / 0.0025) + 0.18 * np.exp(-((cy - 0.05) ** 2) / 0.003))[..., None]
wrap = np.clip(col * shade + gloss + (detail * quiet)[..., None] * 1.1, 0, 1)

# the red race number on the rear glass goes too: tint it like the dark glass around it
glass = Image.new("L", (W, H), 0)
ImageDraw.Draw(glass).polygon(P([(945, 140), (1150, 150), (1245, 235), (1240, 252), (1100, 264), (945, 272)]), fill=255)
red = (a[..., 0] > 0.45) & (a[..., 1] < 0.4) & (np.asarray(glass) > 0)
red = np.asarray(Image.fromarray((red * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32)[..., None] / 255
a = a * (1 - red) + np.array([0.24, 0.25, 0.27], dtype=np.float32) * red

m = (np.asarray(mask).astype(np.float32) / 255)[..., None]
res = a * (1 - m) + wrap * m
Image.fromarray((res * 255).astype(np.uint8)).save(out, quality=88)
