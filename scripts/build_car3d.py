# usage: build_car3d.py <body> <in.glb> <out.glb> [normal blur radius]
# Turns a Tripo "generate parts" car into the calculator's 3D model: one mesh per wrap panel, named
# with the calculator's panel ids (capota, usa-fata-dr, ...), plus non-clickable groups (glass, tyre,
# light, trim, interior) the viewer gives their own material.
# Tripo's own part edges are ragged and it glues panels together, so the painted parts are merged and
# cut again with flat planes along the real panel seams (door edges, hood line, bumper line, roof
# line), placed from landmarks: the wheels, the doors and the hood. Each piece then gets its panel
# from where it sits. Shading is smoothed afterwards (Tripo's surfaces are lumpy).
# The car faces +x, up is +y, its right side is +z.
import sys
import numpy as np
import trimesh
from scipy.spatial import cKDTree

body, src, dst = sys.argv[1:4]
BLUR = float(sys.argv[4]) if len(sys.argv) > 4 else 0.02   # normal blur radius (the car is 1 long)

# per body: which Tripo part is what. "panels" are the painted parts (the doors and the hood also
# place the seams; mirrors keep their own part); "paint" are painted parts with no panel of their own;
# "groups" are not wrapped. "cuts" overrides a seam the landmarks place badly.
CONFIG = {
    "sedan": {
        "panels": {5: "bara-fata", 27: "capota", 34: "capota", 3: "plafon", 11: "plafon",
                   26: "aripa-fata", 14: "aripa-fata", 15: "usa-fata", 18: "usa-fata",
                   31: "usa-spate", 32: "usa-spate", 23: "oglinda", 40: "oglinda"},
        "paint": [24, 8, 22, 35],
        "groups": {"glass": [12, 33, 41, 28, 29, 36], "tyre": [1, 2, 4, 7, 44, 49], "light": [20, 43, 42, 45],
                   "trim": [21, 48, 50, 0]},
        "wheels": [1, 2, 4, 7],
    },
    "hatchback": {
        "panels": {1: "bara-fata", 9: "capota", 18: "usa-fata", 2: "usa-fata", 10: "usa-spate", 11: "usa-spate"},
        "paint": [0],
        "groups": {"glass": [8, 20], "tyre": [4, 5, 6, 17], "light": [29, 31, 30], "trim": [13, 15, 22]},   # no mirrors on the hatchback's panel list
        "wheels": [4, 5, 6, 17],
    },
    "break": {
        "panels": {13: "bara-fata", 4: "capota", 3: "plafon", 20: "plafon", 27: "aripa-fata", 18: "aripa-fata",
                   16: "usa-fata", 17: "usa-fata", 22: "usa-spate", 12: "usa-spate", 15: "oglinda", 33: "oglinda",
                   11: "portbagaj"},
        "paint": [2, 1, 28, 31],
        "groups": {"glass": [24], "tyre": [5, 6, 7, 8, 10, 14, 19, 21, 30, 37, 38, 39, 40, 41], "light": [42, 45, 43, 44],
                   "trim": [9, 25, 29, 23, 32, 36, 34, 35, 46, 47, 48]},
        "wheels": [6, 7, 8, 19],
    },
    "suv": {
        "panels": {5: "bara-fata", 8: "capota", 12: "usa-fata", 14: "usa-fata", 10: "usa-spate", 11: "usa-spate",
                   20: "aripa-fata", 15: "aripa-fata", 29: "oglinda", 37: "oglinda", 18: "oglinda"},
        "paint": [1, 0, 17, 23],
        "roof-from": [22, 16],     # the side windows reach well above the doors
        "groups": {"glass": [6, 22, 16, 25, 13, 21], "tyre": [2, 3, 4, 7], "light": [30, 31, 19, 32],
                   "trim": [9, 27, 28, 34, 35, 24, 26, 33, 36]},
        "wheels": [2, 3, 4, 7],
    },
    "utilitara": {
        "panels": {17: "usa-fata", 12: "usa-fata", 28: "usa-fata", 33: "usa-fata", 3: "usa-culisanta", 16: "usa-culisanta"},
        "paint": [0],
        "cuts": {"x_cowl": 0.335, "y_shoulder": 0.005, "y_fb": -0.07, "y_rb": -0.07},
        "groups": {"glass": [19], "tyre": [4, 5, 6, 7, 8, 9, 10, 11], "light": [22, 13, 26, 27],
                   "trim": [1, 14, 20, 15, 21, 23, 29, 30, 31, 35, 36, 37]},
        "wheels": [4, 5, 6, 11],
    },
}
cfg = CONFIG[body]
GROUP_NAMES = {"glass", "tyre", "light", "trim", "interior"}

sc = trimesh.load(src, force="scene")
parts = {}
for name in sc.graph.nodes_geometry:
    T, geom = sc.graph[name]
    m = sc.geometry[geom].copy()
    m.apply_transform(T)
    parts[int(name.split("_")[-1])] = m

panels = cfg["panels"]
side = lambda z: "dr" if z > 0 else "st"
of = lambda label: [parts[i] for i, p in panels.items() if p == label]
mirrors = [i for i, p in panels.items() if p == "oglinda"]
paint_ids = [i for i in panels if i not in mirrors] + cfg.get("paint", [])
paint = trimesh.util.concatenate([parts[i] for i in paint_ids])
P = paint.vertices

# ---- seams, from the landmarks
wheels = [parts[i] for i in cfg["wheels"]]
front_w = [w for w in wheels if w.vertices[:, 0].mean() > 0]
rear_w = [w for w in wheels if w.vertices[:, 0].mean() < 0]
fdoors, rdoors = of("usa-fata"), of("usa-spate") + of("usa-culisanta")
rear_door = "usa-culisanta" if of("usa-culisanta") else "usa-spate"
van = body == "utilitara"
C = {
    "xf_bumper": max(w.bounds[1][0] for w in front_w),          # front of the front wheels
    "xr_bumper": min(w.bounds[0][0] for w in rear_w),           # back of the rear wheels
    "x_door_f": max(d.bounds[1][0] for d in fdoors),            # front edge of the front doors
    "x_door_m": min(d.bounds[0][0] for d in fdoors),            # front doors | rear doors
    "x_door_r": min(d.bounds[0][0] for d in rdoors),            # back edge of the rear doors
    "y_roof": max(d.bounds[1][1] for d in fdoors + rdoors) - 0.004,
    "y_fb": max(w.bounds[1][1] for w in front_w),               # bumpers reach the top of the wheels
    "y_rb": max(w.bounds[1][1] for w in rear_w),
    "tail_z": 0.8,                                              # tailgate seams, share of the half width
}
if cfg.get("roof-from"):
    C["y_roof"] = max(parts[i].bounds[1][1] for i in cfg["roof-from"]) - 0.004
hood = of("capota")
if hood:
    hv = np.concatenate([h.vertices for h in hood])
    C["x_cowl"] = hv[:, 0].min()                                 # the windscreen's base
    zh = np.abs(hv[:, 2]).max()
    C["y_shoulder"] = float(np.median(hv[np.abs(hv[:, 2]) > zh * 0.85, 1]))   # hood | fender seam
C.update(cfg.get("cuts", {}))
C.setdefault("tail_x", C["xr_bumper"])
zmax = np.abs(P[:, 2]).max()
print({k: round(float(v), 3) for k, v in C.items()})

# ---- cut the paint with every seam plane, so no triangle straddles a seam
def cut(meshes, axis, value):
    n = np.zeros(3)
    n[axis] = 1
    o = n * value
    res = []
    for m in meshes:
        for sgn in (1, -1):
            v, f = trimesh.intersections.slice_faces_plane(m.vertices, m.faces, n * sgn, o)[:2]
            if len(f):
                res.append(trimesh.Trimesh(v, f, process=False))
    return res

pieces = [paint]
planes = [(0, C[k]) for k in ("xf_bumper", "xr_bumper", "x_door_f", "x_door_m", "x_door_r", "x_cowl", "tail_x")] + \
         [(1, C[k]) for k in ("y_roof", "y_shoulder", "y_fb", "y_rb")] + \
         [(2, 0.0)] + ([] if van else [(2, C["tail_z"] * zmax), (2, -C["tail_z"] * zmax)])
for axis, v in planes:
    pieces = cut(pieces, axis, float(v))
mesh = trimesh.util.concatenate(pieces)

def panel_at(x, y, z):
    s = side(z)
    if y > C["y_roof"]:
        return "plafon"
    if x > C["x_door_f"]:                                      # the nose
        if x > C["xf_bumper"] and y < C["y_fb"]:
            return "bara-fata"
        if y > C["y_shoulder"]:
            return "capota" if x > C["x_cowl"] else "plafon"   # behind the hood: the windscreen pillars
        return f"aripa-fata-{s}"
    if x > C["x_door_m"]:
        return f"usa-fata-{s}"
    if x > C["x_door_r"]:
        return f"{rear_door}-{s}"
    if x < C["xr_bumper"] and y < C["y_rb"]:                   # the tail
        return "bara-spate"
    if van:
        return f"panou-lateral-{s}"                            # the rear doors too
    if x < C["tail_x"] and abs(z) < C["tail_z"] * zmax:
        return "portbagaj"
    return f"aripa-spate-{s}"

labels = np.array([panel_at(*c) for c in mesh.triangles_center], dtype=object)
out = {}
def add(label, m):
    out.setdefault(label, []).append(m)
for name in sorted(set(labels)):
    add(str(name), mesh.submesh([np.where(labels == name)[0]], append=True))
for i in mirrors:
    add(f"oglinda-{side(parts[i].vertices[:, 2].mean())}", parts[i])
used = set(paint_ids) | set(mirrors)
for g, ids in cfg["groups"].items():
    for i in ids:
        add(g, parts[i])
        used.add(i)
for i, m in parts.items():
    if i not in used:
        add("interior", m)

# ---- smooth shading: every vertex gets the average normal of the faces around it (same-facing ones
# only, so the inside of a panel does not cancel its outside). The shape stays, the dents stop showing.
# Painted panels are done together, so their edges shade alike.
def blurred_normals(meshes):
    allm = trimesh.util.concatenate(meshes)
    fn = allm.face_normals * allm.area_faces[:, None]
    tree = cKDTree(allm.triangles_center)
    res = []
    for m in meshes:
        n0 = m.vertex_normals
        d, j = tree.query(m.vertices, k=96, distance_upper_bound=BLUR)
        ok = np.isfinite(d)
        nn = fn[np.where(ok, j, 0)]
        w = (ok & (np.einsum("vkc,vc->vk", nn, n0) > 0)) * (1 - np.where(ok, d, BLUR) / BLUR)
        acc = np.einsum("vk,vkc->vc", w, nn)
        ln = np.linalg.norm(acc, axis=1, keepdims=True)
        res.append(np.where(ln > 1e-12, acc / np.maximum(ln, 1e-12), n0))
    return res

merged = {label: trimesh.util.concatenate(ms) for label, ms in out.items()}
painted = [l for l in merged if l not in GROUP_NAMES]
normals = dict(zip(painted, blurred_normals([merged[l] for l in painted])))
for l in merged:
    if l not in normals and l != "tyre":
        normals[l] = blurred_normals([merged[l]])[0]
scene = trimesh.Scene()
for label, m in merged.items():
    m.visual = trimesh.visual.ColorVisuals(m)   # plain: the viewer sets the materials
    if label in normals:
        m.vertex_normals = normals[label]
    scene.add_geometry(m, geom_name=label, node_name=label)
scene.export(dst, include_normals=True)
print({k: len(v) for k, v in out.items()})
