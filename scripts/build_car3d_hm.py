# usage: build_car3d_hm.py <body> <in.glb> <out.glb>
# Turns a hand-modelled car (Sketchfab, CC-BY) into the calculator's 3D model. The painted body parts
# become one mesh per wrap panel, named with the calculator's panel ids (capota, usa-fata-dr, ...); every
# other part keeps its own material and texture, under a name starting with "keep" (the viewer leaves
# those alone). Doors, hood, boot lid and mirrors are separate pieces in these models, so they keep their
# real edges; the one-piece shell (roof, fenders, quarters, bumpers) is cut with flat planes along the
# seams, placed from the doors, the hood and the wheels.
# The car is turned to face +x, up +y, right side +z, and scaled to length 1 on the floor.
import sys
import numpy as np
import trimesh

body, src, dst = sys.argv[1:4]

# per body: how the source is turned, which nodes are paint, which are wheels, and seam overrides
CONFIG = {
    "sedan": {
        "rot_y": 90,                                   # source faces +z
        "paint": ["body_main_paint"],                  # node name parts of the painted body
        "drop": [],                                    # node name parts left out (badges...)
        "wheels": ["wheels_tyre_side"],
        "cuts": {},
    },
}
cfg = CONFIG[body]

sc = trimesh.load(src, force="scene")
# flatten: every node as its own mesh in world space, then turn and scale the lot
meshes = []
for name in sc.graph.nodes_geometry:
    T, g = sc.graph[name]
    m = sc.geometry[g].copy()
    m.apply_transform(T)
    meshes.append((name, m))
R = trimesh.transformations.rotation_matrix(np.radians(cfg["rot_y"]), [0, 1, 0])
allv = np.concatenate([m.vertices for _, m in meshes])
allv = trimesh.transform_points(allv, R)
lo, hi = allv.min(0), allv.max(0)
S = trimesh.transformations.scale_matrix(1 / (hi[0] - lo[0]))
Tr = trimesh.transformations.translation_matrix([-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2])
M = S @ Tr @ R
for _, m in meshes:
    m.apply_transform(M)

is_paint = lambda n: any(p in n for p in cfg["paint"])
paint = [m for n, m in meshes if is_paint(n)]
keep = [(n, m) for n, m in meshes if not is_paint(n) and not any(d in n for d in cfg["drop"])]
wheels = trimesh.util.concatenate([m for n, m in meshes if any(w in n for w in cfg["wheels"])])

# ---- the painted pieces: the biggest is the shell, the others are panels of their own
pm = trimesh.util.concatenate(paint)
pm.merge_vertices(merge_tex=True, merge_norm=True)
pieces = sorted(pm.split(only_watertight=False), key=lambda c: -len(c.faces))
shell, loose = pieces[0], pieces[1:]
side = lambda z: "dr" if z > 0 else "st"
zmax = np.abs(pm.vertices[:, 2]).max()

def bb(m):
    return m.bounds
# doors: the big upright side pieces; hood: the big flat piece at the front; boot lid: the one at the back
side_pieces = [p for p in loose if len(p.faces) > 150 and np.abs(p.vertices[:, 2]).min() > zmax * 0.6 and np.ptp(p.vertices[:, 1]) > 0.08]
side_pieces.sort(key=lambda p: -p.vertices[:, 0].mean())
fdoors = [p for p in side_pieces if p.vertices[:, 0].mean() > np.median([q.vertices[:, 0].mean() for q in side_pieces])]
rdoors = [p for p in side_pieces if p not in fdoors]
flat = [p for p in loose if len(p.faces) > 150 and np.abs(p.vertices[:, 2]).max() > zmax * 0.5 and p not in side_pieces]
hood = max((p for p in flat if p.vertices[:, 0].mean() > 0.2), key=lambda p: len(p.faces), default=None)
boot = max((p for p in flat if p.vertices[:, 0].mean() < -0.3), key=lambda p: len(p.faces), default=None)

# ---- seams
wv = wheels.vertices
front_w, rear_w = wv[wv[:, 0] > 0], wv[wv[:, 0] < 0]
C = {
    "xf_bumper": front_w[:, 0].max(),
    "xr_bumper": rear_w[:, 0].min(),
    "x_door_f": max(bb(d)[1][0] for d in fdoors),
    "x_door_m": min(bb(d)[0][0] for d in fdoors),
    "x_door_r": min(bb(d)[0][0] for d in rdoors),
    "y_roof": max(bb(d)[1][1] for d in fdoors + rdoors) - 0.004,
    "y_fb": front_w[:, 1].max(),
    "y_rb": rear_w[:, 1].max(),
    "x_cowl": bb(hood)[0][0],
    "y_shoulder": bb(hood)[0][1] + 0.004,
    "tail_z": 0.8,
}
C.update(cfg["cuts"])
C.setdefault("tail_x", C["xr_bumper"])
print({k: round(float(v), 3) for k, v in C.items()})

def panel_at(x, y, z):
    s = side(z)
    if y > C["y_roof"]:
        return "plafon"
    if x > C["x_door_f"]:
        if x > C["xf_bumper"] and y < C["y_fb"]:
            return "bara-fata"
        if y > C["y_shoulder"]:
            return "capota" if x > C["x_cowl"] else "plafon"
        return f"aripa-fata-{s}"
    if x > C["x_door_m"]:
        return f"usa-fata-{s}"
    if x > C["x_door_r"]:
        return f"usa-spate-{s}"
    if x < C["xr_bumper"] and y < C["y_rb"]:
        return "bara-spate"
    if x < C["tail_x"] and abs(z) < C["tail_z"] * zmax:
        return "portbagaj"
    return f"aripa-spate-{s}"

out = {}
def add(label, m):
    out.setdefault(label, []).append(m)

# loose pieces keep their real edges: doors, hood, boot lid, mirrors by what they are, the rest
# (small trims in body colour) by where they sit
for p in loose:
    c = p.vertices.mean(0)
    if any(p is d for d in fdoors):
        add(f"usa-fata-{side(c[2])}", p)
    elif any(p is d for d in rdoors):
        add(f"usa-spate-{side(c[2])}", p)
    elif p is hood:
        add("capota", p)
    elif p is boot:
        add("portbagaj", p)
    elif abs(c[2]) > zmax * 0.85 and c[1] > C["y_shoulder"] and C["x_door_m"] < c[0] < C["x_cowl"] + 0.05:
        add(f"oglinda-{side(c[2])}", p)
    else:
        add(panel_at(*c), p)

# the shell: cut along every seam plane, then each piece by where it sits
def cut(ms, axis, value):
    n = np.zeros(3)
    n[axis] = 1
    res = []
    for m in ms:
        for sgn in (1, -1):
            v, f = trimesh.intersections.slice_faces_plane(m.vertices, m.faces, n * sgn, n * value)[:2]
            if len(f):
                res.append(trimesh.Trimesh(v, f, process=False))
    return res
parts = [shell]
planes = [(0, C[k]) for k in ("xf_bumper", "xr_bumper", "x_door_f", "x_door_m", "x_door_r", "x_cowl", "tail_x")] + \
         [(1, C[k]) for k in ("y_roof", "y_shoulder", "y_fb", "y_rb")] + \
         [(2, 0.0), (2, C["tail_z"] * zmax), (2, -C["tail_z"] * zmax)]
for axis, v in planes:
    parts = cut(parts, axis, float(v))
sm = trimesh.util.concatenate(parts)
labels = np.array([panel_at(*c) for c in sm.triangles_center], dtype=object)
for name in sorted(set(labels)):
    add(str(name), sm.submesh([np.where(labels == name)[0]], append=True))

scene = trimesh.Scene()
for label, ms in out.items():
    m = trimesh.util.concatenate(ms)
    m.visual = trimesh.visual.ColorVisuals(m)          # the viewer paints the panels
    scene.add_geometry(m, geom_name=label, node_name=label)
for i, (n, m) in enumerate(keep):
    nm = f"keep-{i}"
    scene.add_geometry(m, geom_name=nm, node_name=nm)
scene.export(dst, include_normals=True)
print({k: len(v) for k, v in out.items()}, "kept", len(keep))
