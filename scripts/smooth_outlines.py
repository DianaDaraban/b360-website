"""Smooths the calculator's 2D panel outlines: drop the pixel steps (Ramer-Douglas-Peucker), then round
the corners a little (Chaikin), so the contours drawn around chosen panels read as clean curves.
segment_panels.py runs every outline through smooth(); run alone it smooths an existing geometry file:
python scripts/smooth_outlines.py data/calculator-geometry.ts"""
import json, re, sys
import numpy as np


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    ab, ap = b - a, pts - a
    n = np.hypot(*ab)
    d = np.abs(ab[0] * ap[:, 1] - ab[1] * ap[:, 0]) / n if n else np.hypot(*ap.T)
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(pts[: i + 1], eps)[:-1], rdp(pts[i:], eps)])
    return np.array([a, b])


def closed_rdp(pts, eps):
    # split the ring at the point farthest from the start, so both halves keep their shape
    i = int(np.argmax(np.hypot(*(pts - pts[0]).T)))
    a = rdp(pts[: i + 1], eps)
    b = rdp(np.vstack([pts[i:], pts[:1]]), eps)
    return np.vstack([a[:-1], b[:-1]])


def chaikin(pts, rounds):
    for _ in range(rounds):
        nxt = np.roll(pts, -1, 0)
        q = 0.78 * pts + 0.22 * nxt          # a gentle cut: corners round, long straight runs stay straight
        r = 0.22 * pts + 0.78 * nxt
        pts = np.empty((len(pts) * 2, 2))
        pts[0::2], pts[1::2] = q, r
    return pts


def smooth(d):
    out = []
    for sub in re.findall(r"M[^M]*", d):
        pts = np.array([[float(v) for v in p.split(",")] for p in re.findall(r"-?[\d.]+,-?[\d.]+", sub)])
        if len(pts) < 4:
            out.append(sub)
            continue
        pts = closed_rdp(pts, 2.2)
        if len(pts) >= 3:
            pts = chaikin(pts, 2)
        out.append("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z")
    return "".join(out)


if __name__ == "__main__":
    src = sys.argv[1]
    text = open(src, encoding="utf8").read()
    m = re.search(r"export const geometry = (\{.*\}) as const", text, re.S)
    geo = json.loads(m.group(1))
    n = 0
    for body in geo.values():
        for view in body.values():
            for p in view["panels"]:
                p[1] = smooth(p[1])
                n += 1
    text = text[: m.start(1)] + json.dumps(geo) + text[m.end(1):]
    open(src, "w", encoding="utf8").write(text)
    print("smoothed", n, "outlines")
