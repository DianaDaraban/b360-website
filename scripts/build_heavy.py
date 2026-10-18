# usage: build_heavy.py <autocar|camion> <out.glb> [map.png]
# The calculator's 3D models for the big vehicles, from hand-modelled Sketchfab models (CC BY):
#   autocar: the coach; panels: fata, spate, plafon, lateral-fata/-mijloc/-spate on each side
#   camion:  a tractor unit with its semi-trailer, put together here; panels: cabina-fata, cabina-usa,
#            cabina-lateral, cabina-plafon (roof and deflector), remorca-lateral, remorca-fata,
#            remorca-spate, remorca-plafon, remorca-lateral-fata / -spate
# Like build_car3d_hm.py: the painted parts become one mesh per panel (named with the panel id, "-st"/
# "-dr" for the sides), cut with flat planes along the seams (normals interpolated, so the shading
# stays the author's); every other part keeps its material under a name starting with "keep".
# Each source is turned to face +x (up +y, right side +z); the vehicle ends up with length 1.
# With a third argument it only draws the side map (right side, with a ruler) to read seams from.
import sys
import numpy as np
import trimesh
from PIL import Image, ImageDraw

kind, dst = sys.argv[1:3]
MAP = sys.argv[3] if len(sys.argv) > 3 else None

# sources: file, turn about y (degrees), paint (parts of node or material names), real length (m)
SOURCES = {
    "autocar": [{"file": "raw-bus.glb", "rot_y": 90, "paint": ["bodi3", "bodi_bodi"], "length": 12.2}],
    "camion": [
        {"file": "raw-mantgx.glb", "rot_y": 90, "paint": ["Grey"], "length": 6.0, "part": "cabina"},
        {"file": "raw-trailer.glb", "rot_y": -90, "paint": ["paint_trailer", "Paint_trailer_botton"], "length": 13.6, "part": "remorca"},
    ],
}
CUTS = {
    "autocar": {},
    "camion": {},
}

def load(src):
    sc = trimesh.load(src["file"], force="scene", process=False)
    out = []
    for name in sc.graph.nodes_geometry:
        T, g = sc.graph[name]
        m = sc.geometry[g].copy()
        m.apply_transform(T)
        mat = getattr(getattr(m.visual, "material", None), "name", None) or ""
        out.append((name, mat, m))
    R = trimesh.transformations.rotation_matrix(np.radians(src["rot_y"]), [0, 1, 0])
    v = trimesh.transform_points(np.concatenate([m.vertices for _, _, m in out]), R)
    lo, hi = v.min(0), v.max(0)
    s = src["length"] / (hi[0] - lo[0])                 # metres
    M = trimesh.transformations.scale_matrix(s) @ trimesh.transformations.translation_matrix([-lo[0], -lo[1], -(lo[2] + hi[2]) / 2]) @ R
    for _, _, m in out:
        m.apply_transform(M)
    return out

# ---- load, place (the trailer's front over the tractor's fifth wheel), scale to length 1
parts = []                                              # (source, name, mat, mesh)
for i, src in enumerate(SOURCES[kind]):
    ms = load(src)
    parts += [(src, n, t, m) for n, t, m in ms]
# put the trailer so its front sits 1.0 m behind the cab's back
if kind == "camion":
    cab = [m for s, n, t, m in parts if s.get("part") == "cabina"]
    trl = [m for s, n, t, m in parts if s.get("part") == "remorca"]
    cab_v = np.concatenate([m.vertices for m in cab])
    cab_paint = np.concatenate([m.vertices for s, n, t, m in parts if s.get("part") == "cabina" and any(k in n or k in t for k in s["paint"])])
    cab_back = cab_paint[cab_paint[:, 1] > 1.6][:, 0].min()   # the cab's back wall (not the chassis fenders behind it)
    # the trailer is 13.6 m long with its front at x = 0 in its own frame: its front goes 0.9 m behind the cab
    shift = (cab_back - 0.9) - 13.6
    for m in trl:
        m.apply_translation([shift, 0, 0])

is_paint = lambda s, n, t: any(k in n or k in t for k in s["paint"])
paint = [(s, m) for s, n, t, m in parts if is_paint(s, n, t)]
keep = [m for s, n, t, m in parts if not is_paint(s, n, t)]

def normaliser():
    allv = np.concatenate([m.vertices for _, _, _, m in parts])
    lo, hi = allv.min(0), allv.max(0)
    L = hi[0] - lo[0]
    print("length", round(L, 2), "m")
    return trimesh.transformations.scale_matrix(1 / L) @ trimesh.transformations.translation_matrix([-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2])

if MAP:
    pm = trimesh.util.concatenate([m for _, m in paint])
    pm.apply_transform(normaliser())
    S = 2000
    H = int(0.5 * S)
    img = np.full((H, S), 235, np.uint8)
    depth = np.full(img.shape, -9.0)
    c, n = pm.triangles_center, pm.face_normals
    for (x, y, z), nn in zip(c, n):
        if z <= 0: continue
        px, py = int((x + 0.5) * S), int((0.4 - y) * S)
        if 0 <= px < S and 0 <= py < H and z > depth[py, px]:
            depth[py, px] = z
            img[py, px] = int(60 + 170 * max(0, nn[2]))
    im = Image.fromarray(img).convert("RGB")
    d = ImageDraw.Draw(im)
    for t in np.arange(-0.5, 0.501, 0.025):
        x = int((t + 0.5) * S); d.line([(x, 0), (x, H)], fill=(255, 190, 190) if round(t * 40) % 2 else (255, 140, 140)); d.text((x + 2, 4), f"{t:+.3f}", fill=(200, 0, 0))
    for t in np.arange(0, 0.4, 0.025):
        y = int((0.4 - t) * S); d.line([(0, y), (S, y)], fill=(180, 180, 255)); d.text((4, y - 12), f"{t:.3f}", fill=(0, 0, 200))
    im.save(MAP)
    print("map", MAP, "zmax", round(float(np.abs(pm.vertices[:, 2]).max()), 4), "ymax", round(float(pm.vertices[:, 1].max()), 4))
    sys.exit()

# ---- panels (in metres, before the vehicle is scaled to length 1; x from the back, 0, to the front)
side = lambda z: "dr" if z > 0 else "st"
if kind == "autocar":
    Y_ROOF, X_FRONT, X_REAR, X1, X2 = 3.20, 11.65, 0.31, 7.93, 4.03
    PLANES = [(1, Y_ROOF), (0, X_FRONT), (0, X_REAR), (0, X1), (0, X2), (2, 0.0)]
    def panel_at(x, y, z, part, ny=0):
        if y > Y_ROOF: return "plafon"
        if x > X_FRONT: return "fata"
        if x < X_REAR: return "spate"
        s = side(z)
        return f"lateral-fata-{s}" if x > X1 else f"lateral-mijloc-{s}" if x > X2 else f"lateral-spate-{s}"
else:
    cab_front = max(m.vertices[:, 0].max() for s_, n, t, m in parts if s_.get("part") == "cabina")
    trl = np.concatenate([m.vertices for s_, n, t, m in parts if s_.get("part") == "remorca" and is_paint(s_, n, t)])
    T_FRONT, T_REAR, T_TOP = trl[:, 0].max(), trl[:, 0].min(), trl[:, 1].max()
    C_FRONT, C_ROOF, C_DOOR_B, C_DOOR_F, C_BACK = cab_front - 0.2, 3.06, 4.55, 5.60, cab_back
    T_MID = (T_FRONT + T_REAR) / 2                          # sides in two halves: many trailers are lettered only at the back
    PLANES = [(0, C_FRONT), (1, C_ROOF), (0, C_DOOR_B), (0, C_DOOR_F), (0, T_FRONT - 0.06), (0, T_REAR + 0.06), (0, T_MID), (1, T_TOP - 0.06), (2, 0.0)]
    def panel_at(x, y, z, part, ny=0):
        s = side(z)
        if part == "cabina":
            if x < C_BACK - 0.05 and y < 1.6: return None          # chassis fenders and side skirts: not part of the cab wrap
            if x > C_FRONT: return "cabina-fata"
            if y > C_ROOF: return "cabina-plafon"
            if C_DOOR_B < x < C_DOOR_F and y > 1.2: return f"cabina-usa-{s}"
            return f"cabina-lateral-{s}"
        if y > T_TOP - 0.06 or (y > T_TOP - 0.4 and ny > 0.7): return "remorca-plafon"   # the roof sags a little
        if x > T_FRONT - 0.06: return "remorca-fata"
        if x < T_REAR + 0.06: return "remorca-spate"
        return f"remorca-lateral-{'fata' if x > T_MID else 'spate'}-{s}"

def cut(ms, axis, value):
    nrm = np.zeros(3); nrm[axis] = 1
    res = []
    for v, f, nr in ms:
        for sgn in (1, -1):
            v1, f1, a = trimesh.intersections.slice_faces_plane(v, f, nrm * sgn, nrm * value, uv=nr[:, :2])
            _, _, b = trimesh.intersections.slice_faces_plane(v, f, nrm * sgn, nrm * value, uv=np.c_[nr[:, 2], np.zeros(len(nr))])
            if len(f1):
                res.append((v1, f1, np.c_[a, b[:, 0]]))
    return res

out = {}
def add(label, m):
    out.setdefault(label, []).append(m)
for src, m in paint:
    pieces = [(m.vertices, m.faces, m.vertex_normals)]
    for axis, val in PLANES:
        pieces = cut(pieces, axis, float(val))
    for v, f, nr in pieces:
        pm_ = trimesh.Trimesh(v, f, process=False)
        pm_.vertex_normals = nr / np.maximum(np.linalg.norm(nr, axis=1, keepdims=True), 1e-9)
        labels = np.array([panel_at(*c, src.get("part"), nf[1]) for c, nf in zip(pm_.triangles_center, pm_.face_normals)], dtype=object)
        for lab in set(labels):
            sub = pm_.submesh([np.where(labels == lab)[0]], append=True)
            if lab is None:
                keep.append(sub)                                  # stays in its own colour
            else:
                add(str(lab), sub)

N = normaliser()
scene = trimesh.Scene()
for label, ms in out.items():
    m = trimesh.util.concatenate(ms)
    m.apply_transform(N)
    nr = m.vertex_normals.copy()
    m.visual = trimesh.visual.ColorVisuals(m)
    m.vertex_normals = nr
    scene.add_geometry(m, geom_name=label, node_name=label)
for i, m in enumerate(keep):
    m.apply_transform(N)
    scene.add_geometry(m, geom_name=f"keep-{i}", node_name=f"keep-{i}")
scene.export(dst, include_normals=True)
print({k: len(v) for k, v in out.items()}, "kept", len(keep))
