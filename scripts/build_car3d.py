# usage: build_car3d.py <body> <in.glb> <out.glb>
# Turns a Tripo "generate parts" car into the calculator's 3D model: one mesh per wrap panel, named
# with the calculator's panel ids (capota, usa-fata-dr, ...), plus non-clickable groups (glass, tyre,
# light, trim, body, interior) the viewer gives their own material. Parts that Tripo glued together
# are split by position, using the doors and wheels as landmarks:
#   split-rear: a rear quarter with half the rear bumper (and the boot lid edge)
#   shell:      a whole body shell (roof, fenders, rear quarters, tailgate, rear bumper)
#   van-shell:  a van's whole body (roof, hood, fenders, side panels, rear doors, bumpers)
# The car faces +x, up is +y, its right side is +z.
import sys
import numpy as np
import trimesh

body, src, dst = sys.argv[1:4]

# per body: which Tripo part is what. "panels" values are panel ids ("-st"/"-dr" is added from the
# position for side panels); the rest are groups the viewer does not let you pick.
CONFIG = {
    "sedan": {
        "panels": {5: "bara-fata", 27: "capota", 34: "capota", 3: "plafon", 11: "plafon",
                   26: "aripa-fata", 14: "aripa-fata", 15: "usa-fata", 18: "usa-fata",
                   31: "usa-spate", 32: "usa-spate", 23: "oglinda", 40: "oglinda"},
        "split-rear": [24, 8],
        "groups": {"glass": [12, 33, 41, 28, 29, 36], "tyre": [1, 2, 4, 7, 44, 49], "light": [20, 43, 42, 45],
                   "trim": [21, 48, 50, 0], "body": [22, 35]},
        "wheels": [1, 2, 4, 7],
    },
    "hatchback": {
        "panels": {1: "bara-fata", 9: "capota", 18: "usa-fata", 2: "usa-fata", 10: "usa-spate", 11: "usa-spate"},
        "shell": [0],
        "groups": {"glass": [8, 20], "tyre": [4, 5, 6, 17], "light": [29, 31, 30], "trim": [13, 15, 22]},   # no mirrors on the hatchback's panel list
        "wheels": [4, 5, 6, 17],
    },
    "break": {
        "panels": {13: "bara-fata", 4: "capota", 3: "plafon", 20: "plafon", 27: "aripa-fata", 18: "aripa-fata",
                   16: "usa-fata", 17: "usa-fata", 22: "usa-spate", 12: "usa-spate", 15: "oglinda", 33: "oglinda",
                   11: "portbagaj"},
        "split-rear": [2],
        "groups": {"glass": [24], "tyre": [5, 6, 7, 8, 10, 14, 19, 21, 30, 37, 38, 39, 40, 41], "light": [42, 45, 43, 44],
                   "trim": [9, 25, 29, 23, 32, 36, 34, 35, 46, 47, 48], "body": [1, 28, 31]},
        "wheels": [6, 7, 8, 19],
    },
    "suv": {
        "panels": {5: "bara-fata", 8: "capota", 12: "usa-fata", 14: "usa-fata", 10: "usa-spate", 11: "usa-spate",
                   20: "aripa-fata", 15: "aripa-fata", 29: "oglinda", 37: "oglinda", 18: "oglinda"},
        "shell": [1, 0],
        "roof-from": [22, 16],     # the side windows reach well above the doors
        "groups": {"glass": [6, 22, 16, 25, 13, 21], "tyre": [2, 3, 4, 7], "light": [30, 31, 19, 32],
                   "trim": [9, 27, 28, 34, 35, 24, 26, 33, 36], "body": [17, 23]},
        "wheels": [2, 3, 4, 7],
    },
    "utilitara": {
        "panels": {17: "usa-fata", 12: "usa-fata", 28: "usa-fata", 33: "usa-fata", 3: "usa-culisanta", 16: "usa-culisanta"},
        "van-shell": [0],
        "groups": {"glass": [19], "tyre": [4, 5, 6, 7, 8, 9, 10, 11], "light": [22, 13, 26, 27],
                   "trim": [1, 14, 20, 15, 21, 23, 29, 30, 31, 35, 36, 37]},
        "wheels": [4, 5, 6, 11],
    },
}
cfg = CONFIG[body]
SIDED = {"aripa-fata", "usa-fata", "usa-spate", "aripa-spate", "oglinda", "usa-culisanta", "panou-lateral"}

sc = trimesh.load(src, force="scene")
parts = {}
for name in sc.graph.nodes_geometry:
    T, geom = sc.graph[name]
    m = sc.geometry[geom].copy()
    m.apply_transform(T)
    parts[int(name.split("_")[-1])] = m

# landmarks
wheels = [parts[i] for i in cfg["wheels"]]
rear_x0 = min(w.bounds[0][0] for w in wheels if w.vertices[:, 0].mean() < 0)    # back edge of the rear wheels
doors = [parts[i] for i, p in cfg["panels"].items() if p.startswith("usa")]

out = {}
def add(label, mesh):
    out.setdefault(label, []).append(mesh)
def side_of(z):
    return "dr" if z > 0 else "st"
def side(mesh):
    return side_of(mesh.vertices[:, 2].mean())
def add_faces(m, mask, label):
    if mask.any():
        add(label, m.submesh([np.where(mask)[0]], append=True))

for i, label in cfg["panels"].items():
    m = parts[i]
    add(f"{label}-{side(m)}" if label in SIDED else label, m)

for i in cfg.get("split-rear", []):
    m = parts[i]
    c = m.triangles_center
    zmax = np.abs(m.vertices[:, 2]).max()
    behind = c[:, 0] < rear_x0 - 0.01
    bumper = behind & (c[:, 1] < 0.0)
    trunk = behind & (c[:, 1] >= 0.0) & (np.abs(c[:, 2]) < zmax * 0.72)
    add_faces(m, bumper, "bara-spate")
    add_faces(m, trunk, "portbagaj")
    for s, mask in (("dr", c[:, 2] > 0), ("st", c[:, 2] <= 0)):
        add_faces(m, ~(bumper | trunk) & mask, f"aripa-spate-{s}")

if cfg.get("shell"):
    door_front = max(d.bounds[1][0] for d in doors)       # front edge of the front doors
    door_rear = min(d.bounds[0][0] for d in doors)        # back edge of the rear doors
    roof_y = max(d.bounds[1][1] for d in doors) - 0.004   # above the door frames: the roof
    if cfg.get("roof-from"):
        roof_y = max(parts[i].bounds[1][1] for i in cfg["roof-from"]) - 0.004
    for i in cfg["shell"]:
        m = parts[i]
        c, n = m.triangles_center, m.face_normals
        zmax = np.abs(m.vertices[:, 2]).max()
        roof = c[:, 1] > roof_y
        front = ~roof & (c[:, 0] > door_front - 0.005)
        back = ~roof & (c[:, 0] < door_rear + 0.005)
        bumper = back & (c[:, 0] < rear_x0 - 0.01) & (c[:, 1] < 0.0)
        tail = back & ~bumper & (n[:, 0] < -0.45) & (np.abs(c[:, 2]) < zmax * 0.8)
        quarter = back & ~bumper & ~tail
        rest = ~(roof | front | back)
        # between the doors: the pillars go with the roof, the sills under the doors stay plain body
        pillars = rest & (c[:, 1] > roof_y * 0.35)
        rest = rest & ~pillars
        add_faces(m, roof | pillars, "plafon")
        add_faces(m, bumper, "bara-spate")
        add_faces(m, tail, "portbagaj")
        for s, mask in (("dr", c[:, 2] > 0), ("st", c[:, 2] <= 0)):
            add_faces(m, front & mask, f"aripa-fata-{s}")
            add_faces(m, quarter & mask, f"aripa-spate-{s}")
        add_faces(m, rest, "body")

if cfg.get("van-shell"):
    door_front = max(d.bounds[1][0] for d in doors)
    door_rear = min(d.bounds[0][0] for d in doors)
    roof_y = max(d.bounds[1][1] for d in doors) - 0.004
    for i in cfg["van-shell"]:
        m = parts[i]
        c, n = m.triangles_center, m.face_normals
        zmax = np.abs(m.vertices[:, 2]).max()
        xmax = m.vertices[:, 0].max()
        roof = c[:, 1] > roof_y
        front = ~roof & (c[:, 0] > door_front - 0.005)
        back = ~roof & (c[:, 0] < door_rear + 0.005)
        # the nose: low = bumper, the windscreen frame goes with the roof, the rest faces forward / up = hood
        f_bumper = front & (c[:, 1] < -0.07) & (c[:, 0] > xmax - 0.09)
        frame = front & ~f_bumper & (c[:, 1] > 0.045)
        hood = front & ~f_bumper & ~frame & (np.abs(n[:, 2]) < 0.6) & (np.abs(c[:, 2]) < zmax * 0.85)
        fender = front & ~(f_bumper | frame | hood)
        # the back: low rear = bumper, the rest (rear doors too) is the side panel of its side
        r_bumper = back & (c[:, 0] < m.vertices[:, 0].min() + 0.06) & (c[:, 1] < -0.07)
        side_panel = back & ~r_bumper
        mid = ~(roof | front | back)
        mid_panel = mid & (c[:, 1] > -0.12)                    # around the doors, above the sills
        add_faces(m, roof | frame, "plafon")
        add_faces(m, f_bumper, "bara-fata")
        add_faces(m, hood, "capota")
        add_faces(m, r_bumper, "bara-spate")
        for s, mask in (("dr", c[:, 2] > 0), ("st", c[:, 2] <= 0)):
            add_faces(m, fender & mask, f"aripa-fata-{s}")
            add_faces(m, (side_panel | mid_panel) & mask, f"panou-lateral-{s}")
        add_faces(m, mid & ~mid_panel, "body")

used = set(cfg["panels"]) | set(cfg.get("van-shell", [])) | set(cfg.get("split-rear", [])) | set(cfg.get("shell", [])) | {i for g in cfg["groups"].values() for i in g}
for g, ids in cfg["groups"].items():
    for i in ids:
        add(g, parts[i])
for i, m in parts.items():
    if i not in used:
        add("interior", m)

scene = trimesh.Scene()
for label, meshes in out.items():
    merged = trimesh.util.concatenate(meshes)
    merged.visual = trimesh.visual.ColorVisuals(merged)   # plain: the viewer sets the materials
    scene.add_geometry(merged, geom_name=label, node_name=label)
scene.export(dst, include_normals=True)
print({k: len(v) for k, v in out.items()})
