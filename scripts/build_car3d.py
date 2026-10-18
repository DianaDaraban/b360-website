# usage: build_car3d.py <body> <in.glb> <out.glb>
# Turns a Tripo "generate parts" car into the calculator's 3D model: one mesh per wrap panel, named
# with the calculator's panel ids (capota, usa-fata-dr, ...), plus non-clickable groups (glass, tyre,
# light, trim, body, interior) the viewer gives their own material. Parts that Tripo glued together
# (a rear quarter with half the rear bumper) are split by position, using the wheels as landmarks.
# The car faces +x, up is +y, its right side is +z.
import sys
import numpy as np
import trimesh

body, src, dst = sys.argv[1:4]

# per body: which Tripo part is what. Values: a panel id ("capota"; "-side" is added from the
# position for side panels), a group ("glass", ...), or "split-rear" for quarter + bumper pieces.
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

# landmarks: the rear axle (the rear wheels' x range)
wheels = [parts[i] for i in cfg["wheels"]]
rear = [w for w in wheels if w.vertices[:, 0].mean() < 0]
rear_x0 = min(w.bounds[0][0] for w in rear)          # back edge of the rear wheels

out = {}
def add(label, mesh):
    out.setdefault(label, []).append(mesh)
def side(mesh):
    return "dr" if mesh.vertices[:, 2].mean() > 0 else "st"

for i, label in cfg["panels"].items():
    m = parts[i]
    add(f"{label}-{side(m)}" if label in SIDED else label, m)

for i in cfg["split-rear"]:
    m = parts[i]
    c = m.triangles_center
    zmax = np.abs(m.vertices[:, 2]).max()
    behind = c[:, 0] < rear_x0 - 0.01
    bumper = behind & (c[:, 1] < 0.0)
    trunk = behind & (c[:, 1] >= 0.0) & (np.abs(c[:, 2]) < zmax * 0.72)
    quarter = ~(bumper | trunk)
    s = side(m)
    for label, mask in (("bara-spate", bumper), ("portbagaj", trunk), (f"aripa-spate-{s}", quarter)):
        if mask.any():
            sub = m.submesh([np.where(mask)[0]], append=True)
            add(label, sub)

used = set(cfg["panels"]) | set(cfg["split-rear"]) | {i for g in cfg["groups"].values() for i in g}
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
