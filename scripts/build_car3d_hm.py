# usage: build_car3d_hm.py <body> <in.glb> <out.glb>
# Turns a hand-modelled vehicle (Sketchfab, CC BY) into the calculator's 3D model. The painted body
# parts become one mesh per wrap panel, named with the calculator's panel ids (capota, usa-fata-dr, ...);
# every other part keeps its own material and texture, under a name starting with "keep" (the viewer
# leaves those alone). Doors, hood, boot lid and mirrors are usually separate pieces in these models, so
# they keep their real edges; the big pieces that span seams (the shell with roof, fenders and quarters,
# often the bumpers) are cut with flat planes along the seams, placed from the doors, the hood and the
# wheels.
# The vehicle is turned to face +x, up +y, right side +z, and scaled to length 1 on the floor.
import sys
import numpy as np
import trimesh

body, src, dst = sys.argv[1:4]

# per body: how the source is turned (degrees about y; the source's front must end up at +x), which
# parts are paint and which are tyres (parts of node or material names), parts to leave out, and seam
# overrides
CONFIG = {
    "sedan": {"rot_y": 90, "paint": ["body_main_paint"], "tyre": ["tyre_side"]},
    "hatchback": {"rot_y": -90, "paint": ["1500011Mtl"], "tyre": ["10560011Mtl"]},
    "suv": {"rot_y": 90, "paint": ["Silver_Sky_Metallic"], "tyre": ["Tires"]},
    "utilitara": {"rot_y": 90, "paint": ["Car_Paint"], "tyre": ["Rubber_Tire"], "van": True},
    # the models in use (Sketchfab, by authors who model their own cars)
    "break-v60": {"rot_y": -90, "paint": ["body_paint"], "tyre": ["wheel_tire"], "no_doors": True, "hood_by_normal": True,
                  "cuts": {"x_door_f": 0.18, "x_door_m": -0.045, "x_door_r": -0.215, "x_cowl": 0.20, "y_shoulder": 0.20, "y_roof": 0.27}},
    "hatchback-fabia": {"rot_y": 90, "paint": ["Blue_Car_Paint"], "tyre": ["Car_rubber_wheel"]},
    "utilitara-ducato": {"rot_y": 90, "paint": ["varnish"], "tyre": ["wheel_rubber"], "van": True, "no_doors": True, "hood_by_normal": True,
                         "cuts": {"x_door_f": 0.21, "x_door_m": 0.05, "x_door_r": -0.21, "x_cowl": 0.30, "y_shoulder": 0.25, "y_roof": 0.41}},
    "suv-evoque": {"rot_y": 90, "paint": ["Vehicle_-_Body_-_Paint"], "tyre": ["Tyre"], "drop": ["Logo", "RangeRover", "Range_Rover"]},
    "sedan-generic": {"rot_y": 90, "paint": ["Car_Paint_-_All_Colors"], "tyre": ["tire-low"]},
}
cfg = CONFIG[body]
van = cfg.get("van", False)

sc = trimesh.load(src, force="scene", process=False)   # keep the author's normals untouched
meshes = []                                             # (node name, material name, mesh in world space)
for name in sc.graph.nodes_geometry:
    T, g = sc.graph[name]
    m = sc.geometry[g].copy()
    m.apply_transform(T)
    mat = getattr(getattr(m.visual, "material", None), "name", None) or ""
    meshes.append((name, mat, m))
R = trimesh.transformations.rotation_matrix(np.radians(cfg["rot_y"]), [0, 1, 0])
allv = trimesh.transform_points(np.concatenate([m.vertices for _, _, m in meshes]), R)
lo, hi = allv.min(0), allv.max(0)
M = trimesh.transformations.scale_matrix(1 / (hi[0] - lo[0])) @ \
    trimesh.transformations.translation_matrix([-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2]) @ R
for _, _, m in meshes:
    m.apply_transform(M)

def matches(keys, name, mat):
    return any(k in name or k in mat for k in keys)
paint = [m for n, t, m in meshes if matches(cfg["paint"], n, t)]
keep = [(n, m) for n, t, m in meshes if not matches(cfg["paint"], n, t) and not matches(cfg.get("drop", []), n, t)]
wheels = trimesh.util.concatenate([m for n, t, m in meshes if matches(cfg["tyre"], n, t)])

# ---- the painted pieces: found on a welded copy (UV seams split the real pieces), taken from the
# original so every vertex keeps its own normal and UV
pm = trimesh.util.concatenate(paint)
welded = pm.copy()
welded.merge_vertices(merge_tex=True, merge_norm=True)
comp = trimesh.graph.connected_component_labels(welded.face_adjacency, node_count=len(welded.faces))
pieces = sorted((pm.submesh([np.where(comp == c)[0]], append=True) for c in np.unique(comp)), key=lambda c: -c.area)
side = lambda z: "dr" if z > 0 else "st"
zmax = np.abs(pm.vertices[:, 2]).max()
big = lambda p: p.area > pm.area * 0.01

# doors: big upright pieces on the sides; hood: the big flat one at the front; boot lid / tailgate:
# the big one at the back
# (a door sits between the wheels: a separate fender over a wheel or a quarter panel behind one is not a door)
_wv = wheels.vertices
wheel_f = _wv[_wv[:, 0] > 0][:, 0].mean()
wheel_r = _wv[_wv[:, 0] < 0][:, 0].mean()
side_pieces = [p for p in pieces[1:] if big(p) and np.abs(p.vertices[:, 2]).min() > zmax * 0.55
               and np.ptp(p.vertices[:, 1]) > 0.08 and np.ptp(p.vertices[:, 0]) > 0.08
               and wheel_r + 0.04 < p.vertices[:, 0].mean() < wheel_f - 0.04
               and p.vertices[:, 0].max() < wheel_f and p.vertices[:, 0].min() > wheel_r - 0.03]
front_x = max((p.vertices[:, 0].mean() for p in side_pieces), default=0)
fdoors = [p for p in side_pieces if abs(p.vertices[:, 0].mean() - front_x) < 0.06]
if cfg.get("no_doors"):                                  # the doors are not pieces of their own: cut at the seams given
    side_pieces, fdoors = [], []
rdoors = [p for p in side_pieces if all(p is not d for d in fdoors)]
others = [p for p in pieces[1:] if all(p is not d for d in side_pieces) and big(p)]
hood = max((p for p in others if p.vertices[:, 0].mean() > 0.15 and p.face_normals[:, 1].mean() > 0.3), key=lambda p: p.area, default=None)
boot = max((p for p in others if p.vertices[:, 0].mean() < -0.25 and p is not hood
            and p.vertices[:, 1].mean() > np.percentile(wheels.vertices[:, 1], 95)), key=lambda p: p.area, default=None)   # above the bumper line
print("pieces", len(pieces), "front doors", len(fdoors), "rear doors", len(rdoors), "hood", hood is not None, "boot", boot is not None)

# ---- seams
wv = wheels.vertices
front_w, rear_w = wv[wv[:, 0] > 0], wv[wv[:, 0] < 0]
C = {
    "xf_bumper": front_w[:, 0].max(),
    "xr_bumper": rear_w[:, 0].min(),
    "y_fb": front_w[:, 1].max(),
    "y_rb": rear_w[:, 1].max(),
    "tail_z": 0.8,
}
if fdoors:
    C["x_door_f"] = max(d.bounds[1][0] for d in fdoors)
    C["x_door_m"] = min(d.bounds[0][0] for d in fdoors)
    C["y_roof"] = max(d.bounds[1][1] for d in fdoors + rdoors) - 0.004
if rdoors:
    C["x_door_r"] = min(d.bounds[0][0] for d in rdoors)
if hood is not None:
    C["x_cowl"] = hood.bounds[0][0]
    C["y_shoulder"] = hood.bounds[0][1] + 0.004
C.update(cfg.get("cuts", {}))
C.setdefault("x_door_r", C["x_door_m"])
C.setdefault("x_cowl", C["x_door_f"] + 0.03)
C.setdefault("y_shoulder", C["y_fb"] + 0.03)
C.setdefault("tail_x", C["xr_bumper"])
print({k: round(float(v), 3) for k, v in C.items()})
rear_door = "usa-culisanta" if van else "usa-spate"

def panel_at(x, y, z, ny=None):
    s = side(z)
    if y > C["y_roof"]:
        return "plafon"
    if x > C["x_door_f"]:
        if x > C["xf_bumper"] and y < C["y_fb"]:
            return "bara-fata"
        if cfg.get("hood_by_normal") and ny is not None and x > C["x_cowl"]:
            # no separate hood piece: the hood is the part of the nose that faces up, the fenders the
            # part that faces the sides (a height line lets the fenders' top edge spill onto the hood)
            return "capota" if ny > 0.55 and y > C["y_fb"] else f"aripa-fata-{s}"
        if y > C["y_shoulder"]:
            return "capota" if x > C["x_cowl"] else "plafon"
        return f"aripa-fata-{s}"
    if x > C["x_door_m"]:
        return f"usa-fata-{s}"
    if x > C["x_door_r"]:
        return f"{rear_door}-{s}"
    if x < C["xr_bumper"] and y < C["y_rb"]:
        return "bara-spate"
    if van:
        return f"panou-lateral-{s}"                    # the rear doors too
    if x < C["tail_x"] and abs(z) < C["tail_z"] * zmax:
        return "portbagaj"
    return f"aripa-spate-{s}"

out = {}
def add(label, m):
    out.setdefault(label, []).append(m)

# pieces that keep their real edges: doors, hood, boot lid, mirrors, and small body-colour trims (named
# by where they sit); the big rest is cut along the seams
to_cut = [pieces[0]]
for p in pieces[1:]:
    c = p.vertices.mean(0)
    if any(p is d for d in fdoors):
        add(f"usa-fata-{side(c[2])}", p)
    elif any(p is d for d in rdoors):
        add(f"{rear_door}-{side(c[2])}", p)
    elif p is hood:
        add("capota", p)
    elif p is boot and not van:
        add("portbagaj", p)
    elif not van and abs(c[2]) > zmax * 0.8 and c[1] > C["y_shoulder"] and C["x_door_m"] < c[0] < C["x_cowl"] + 0.05 and not big(p):
        add(f"oglinda-{side(c[2])}", p)
    elif big(p):
        to_cut.append(p)
    else:
        add(panel_at(*c), p)

# the big rest is cut along the seam planes. A cut makes new vertices; their normals are interpolated
# from the author's (slice_faces_plane interpolates "uv", so the normal goes through it in two passes:
# x,y then z), otherwise the shading would show every cut
def cut(ms, axis, value):
    n = np.zeros(3)
    n[axis] = 1
    res = []
    for v, f, nr in ms:
        for sgn in (1, -1):
            v1, f1, a = trimesh.intersections.slice_faces_plane(v, f, n * sgn, n * value, uv=nr[:, :2])
            _, _, b = trimesh.intersections.slice_faces_plane(v, f, n * sgn, n * value, uv=np.c_[nr[:, 2], np.zeros(len(nr))])
            if len(f1):
                res.append((v1, f1, np.c_[a, b[:, 0]]))
    return res
parts = [(p.vertices, p.faces, p.vertex_normals) for p in to_cut]
planes = [(0, C[k]) for k in ("xf_bumper", "xr_bumper", "x_door_f", "x_door_m", "x_door_r", "x_cowl", "tail_x")] + \
         [(1, C[k]) for k in ("y_roof", "y_shoulder", "y_fb", "y_rb")] + \
         [(2, 0.0)] + ([] if van else [(2, C["tail_z"] * zmax), (2, -C["tail_z"] * zmax)])
for axis, val in planes:
    parts = cut(parts, axis, float(val))
cut_meshes = []
for v, f, nr in parts:
    m = trimesh.Trimesh(v, f, process=False)
    m.vertex_normals = nr / np.maximum(np.linalg.norm(nr, axis=1, keepdims=True), 1e-9)
    cut_meshes.append(m)
sm = trimesh.util.concatenate(cut_meshes)
labels = np.array([panel_at(*c, nf[1]) for c, nf in zip(sm.triangles_center, sm.face_normals)], dtype=object)
if cfg.get("hood_by_normal"):
    # the hood | fender seam as one smooth line: along the nose, where the body turns from facing up
    # to facing the side (the half width at which the surface normal is 45 degrees), measured in
    # slices front to back and fitted with a gentle curve; every nose face inside it is the hood
    cen, nrm = sm.triangles_center, sm.face_normals
    nose = np.array([str(l) == "capota" or str(l).startswith("aripa-fata") for l in labels])
    xs, zs = [], []
    lo_x, hi_x = C["x_cowl"], cen[nose][:, 0].max()
    for x0 in np.linspace(lo_x, hi_x, 24)[:-1]:
        band = nose & (cen[:, 0] >= x0) & (cen[:, 0] < x0 + (hi_x - lo_x) / 23) & (cen[:, 1] > C["y_fb"])
        turn = band & (np.abs(nrm[:, 1] - 0.62) < 0.12)
        if turn.sum() >= 6:
            xs.append(x0 + (hi_x - lo_x) / 46)
            zs.append(np.median(np.abs(cen[turn][:, 2])))
    seam = np.poly1d(np.polyfit(xs, zs, 2))
    print("hood seam", [round(float(seam(x)), 3) for x in np.linspace(lo_x, hi_x, 5)])
    # the nose is split into small triangles first (big ones would step along the curve); the new
    # vertices take normals interpolated from the author's
    nm = sm.submesh([np.where(nose)[0]], append=True)
    vn = nm.vertex_normals.copy()
    v, f = trimesh.remesh.subdivide_to_size(nm.vertices, nm.faces, max_edge=0.004)
    # each new vertex lies on one original face: among the nearest faces, the one it is inside
    from scipy.spatial import cKDTree
    cand = cKDTree(nm.triangles_center).query(v, k=min(12, len(nm.faces)))[1]
    best = np.full(len(v), -np.inf); tri = np.zeros(len(v), int); bary = np.zeros((len(v), 3))
    for j in range(cand.shape[1]):
        b = trimesh.triangles.points_to_barycentric(nm.triangles[cand[:, j]], v)
        score = b.min(1)
        better = score > best
        best[better], tri[better], bary[better] = score[better], cand[better, j], b[better]
    bary = np.clip(bary, 0, None); bary /= bary.sum(1, keepdims=True)
    nv = np.einsum("vk,vkc->vc", bary, vn[nm.faces[tri]])
    fine = trimesh.Trimesh(v, f, process=False)
    fine.vertex_normals = nv / np.maximum(np.linalg.norm(nv, axis=1, keepdims=True), 1e-9)
    fc = fine.triangles_center
    lab = np.array([("capota" if (x > C["x_cowl"] and y > C["y_fb"] and abs(z) < seam(x)) else f"aripa-fata-{side(z)}") for x, y, z in fc], dtype=object)
    for name in set(lab):
        add(str(name), fine.submesh([np.where(lab == name)[0]], append=True))
    keep_rest = np.where(~nose)[0]
    sm = sm.submesh([keep_rest], append=True)
    labels = labels[keep_rest]
for name in sorted(set(labels)):
    add(str(name), sm.submesh([np.where(labels == name)[0]], append=True))

scene = trimesh.Scene()
for label, ms in out.items():
    m = trimesh.util.concatenate(ms)
    normals = m.vertex_normals.copy()
    m.visual = trimesh.visual.ColorVisuals(m)          # the viewer paints the panels
    m.vertex_normals = normals
    scene.add_geometry(m, geom_name=label, node_name=label)
for i, (n, m) in enumerate(keep):
    nm = f"keep-{i}"
    scene.add_geometry(m, geom_name=nm, node_name=nm)
scene.export(dst, include_normals=True)
print({k: len(v) for k, v in out.items()}, "kept", len(keep))
