"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import styles from "./Car3D.module.css"

// The calculator's car in 3D (models from Freepik image-to-3D, split into the calculator's panels by
// scripts/build_car3d.py). Drag to turn it, scroll or pinch to zoom, tap a panel to pick it: a press that
// moves the pointer turns the car, a press that stays put picks. Picked panels turn orange, the panel
// under the mouse is tinted and named. It turns slowly on its own until the first touch.

export type View3D = "fata" | "lateral" | "spate" | "sus"
const VIEWS: Record<View3D, [number, number]> = { fata: [70, 14], lateral: [0, 8], spate: [215, 16], sus: [35, 72] }
const START: [number, number] = [38, 16]

// materials of the parts that are not wrapped
const GROUPS: Record<string, { color: number; roughness: number; metalness?: number; opacity?: number }> = {
    glass: { color: 0x1d2a33, roughness: 0.1, metalness: 0.2, opacity: 0.85 },
    tyre: { color: 0x222222, roughness: 0.8 },
    light: { color: 0xdfe4ea, roughness: 0.15, metalness: 0.3 },
    trim: { color: 0x34302f, roughness: 0.6 },
    body: { color: 0xeeebe7, roughness: 0.45 },
    interior: { color: 0x4d4845, roughness: 0.8 },
}
// a node's name (three.js names a mesh after its glTF node, or after the node's parent when the
// node holds several primitives)
const meshName = (o: THREE.Object3D) => (o.name || o.parent?.name || "").replace(/_\d+$/, "")
const PAINT = 0xe4e0db, PICKED = 0x16a39a, HOVER = 0xb9e3df     // picked: a petrol teal (the UI is red already)

type Props = {
    body: string
    selected: string[]
    view: { name: View3D; n: number } | null     // a quick-view request (n changes on every press)
    onPick: (panel: string) => void
    onHover: (panel: string | null) => void
}

export default function Car3D({ body, selected, view, onPick, onHover }: Props) {
    const host = useRef<HTMLDivElement>(null)
    const api = useRef<{ setSelected: (s: string[]) => void; goTo: (v: View3D) => void } | null>(null)
    const pickRef = useRef(onPick), hoverRef = useRef(onHover), selectedRef = useRef(selected)
    pickRef.current = onPick
    hoverRef.current = onHover
    selectedRef.current = selected
    const [loading, setLoading] = useState(true)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        const el = host.current!
        let disposed = false
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.NeutralToneMapping
        el.appendChild(renderer.domElement)

        // soft studio light (a room reflected all round, one gentle key from above): hard side lights
        // made the generated bodies look dented
        const scene = new THREE.Scene()
        const pmrem = new THREE.PMREMGenerator(renderer)
        const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
        scene.environment = env
        scene.environmentIntensity = 0.75
        scene.add(new THREE.HemisphereLight(0xffffff, 0xa79e96, 0.8))
        const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(1.5, 4, 2.5); scene.add(key)
        const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 50)
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.enablePan = false
        controls.maxPolarAngle = THREE.MathUtils.degToRad(86)
        controls.autoRotate = true
        controls.autoRotateSpeed = 1.1
        controls.addEventListener("start", () => { controls.autoRotate = false })

        const panels = new Map<string, THREE.Mesh>()
        let hovered: string | null = null
        let radius = 1, baseRadius = 1
        const center = new THREE.Vector3()
        const paint = () => {
            for (const [name, mesh] of panels) {
                const m = mesh.material as THREE.MeshStandardMaterial
                m.color.setHex(selectedRef.current.includes(name) ? PICKED : name === hovered ? HOVER : PAINT)
            }
        }
        const place = ([az, el]: [number, number]) => {
            const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el)
            return new THREE.Vector3(Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)).multiplyScalar(radius).add(center)
        }
        // quick views glide the camera there
        let glide: { from: THREE.Vector3; to: THREE.Vector3; t: number } | null = null
        const goTo = (v: View3D) => {
            controls.autoRotate = false
            glide = { from: camera.position.clone(), to: place(VIEWS[v]), t: 0 }
        }
        api.current = { setSelected: () => paint(), goTo }

        const loader = new GLTFLoader()
        loader.setMeshoptDecoder(MeshoptDecoder)
        loader.load(`/calculator/3d/${body}.glb`, gltf => {
            if (disposed) return
            const root = gltf.scene
            root.traverse(o => {
                if (!(o as THREE.Mesh).isMesh) return
                const mesh = o as THREE.Mesh
                // parts of hand-modelled cars (glass, lights, wheels, interior) keep their own materials
                if (meshName(mesh).startsWith("keep")) return
                const g = GROUPS[meshName(mesh)]
                mesh.material = g
                    ? new THREE.MeshStandardMaterial({ color: g.color, roughness: g.roughness, metalness: g.metalness ?? 0, transparent: g.opacity !== undefined, opacity: g.opacity ?? 1 })
                    : new THREE.MeshStandardMaterial({ color: PAINT, roughness: 0.5, metalness: 0.05 })
                if (!g) panels.set(meshName(mesh), mesh)
            })
            scene.add(root)
            const box = new THREE.Box3().setFromObject(root)
            box.getCenter(center)
            baseRadius = box.getSize(new THREE.Vector3()).length() * 1.35
            controls.target.copy(center)
            fit()
            camera.position.copy(place(START))
            // a soft shadow under the car
            const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0x3c1414, transparent: true, opacity: 0.12, depthWrite: false }))
            shadow.rotation.x = -Math.PI / 2
            const size = box.getSize(new THREE.Vector3())
            shadow.scale.set(size.x * 0.62, size.z * 0.75, 1)
            shadow.position.set(center.x, box.min.y + 0.002, center.z)
            scene.add(shadow)
            paint()
            setLoading(false)
        }, undefined, () => { if (!disposed) { setFailed(true); setLoading(false) } })

        // pointer: a press that does not move picks the panel under it
        const ray = new THREE.Raycaster(), ndc = new THREE.Vector2()
        const panelAt = (e: PointerEvent) => {
            const r = renderer.domElement.getBoundingClientRect()
            ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
            ray.setFromCamera(ndc, camera)
            const hit = ray.intersectObjects(scene.children, true)[0]
            const name = hit && meshName(hit.object)
            return name && panels.has(name) ? name : null
        }
        let down: { x: number; y: number } | null = null
        const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY } }
        const onUp = (e: PointerEvent) => {
            if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) {
                const name = panelAt(e)
                if (name) pickRef.current(name)
            }
            down = null
        }
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse" || down) return
            const name = panelAt(e)
            if (name === hovered) return
            hovered = name
            renderer.domElement.style.cursor = name ? "pointer" : "grab"
            hoverRef.current(name)
            paint()
        }
        const onLeave = () => { if (hovered) { hovered = null; hoverRef.current(null); paint() } }
        renderer.domElement.addEventListener("pointerdown", onDown)
        renderer.domElement.addEventListener("pointerup", onUp)
        renderer.domElement.addEventListener("pointermove", onMove)
        renderer.domElement.addEventListener("pointerleave", onLeave)
        renderer.domElement.style.cursor = "grab"

        // narrow boards (phones) step the camera back, so the whole car still fits across
        const fit = () => {
            const was = radius
            radius = baseRadius * Math.min(2.2, Math.max(1, 1.5 / camera.aspect))
            controls.minDistance = radius * 0.55
            controls.maxDistance = radius * 1.6
            camera.position.sub(center).multiplyScalar(radius / was).add(center)
        }
        const resize = () => {
            const w = el.clientWidth, h = el.clientHeight
            renderer.setSize(w, h, false)
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            fit()
        }
        const ro = new ResizeObserver(resize)
        ro.observe(el)
        resize()

        let frame = 0
        const tick = () => {
            frame = requestAnimationFrame(tick)
            if (glide) {
                glide.t = Math.min(1, glide.t + 0.045)
                const k = 1 - Math.pow(1 - glide.t, 3)
                // through the side of a sphere around the car, not through it
                const dir = glide.from.clone().sub(center).normalize().lerp(glide.to.clone().sub(center).normalize(), k).normalize()
                camera.position.copy(dir.multiplyScalar(THREE.MathUtils.lerp(glide.from.distanceTo(center), glide.to.distanceTo(center), k)).add(center))
                if (glide.t >= 1) glide = null
            }
            controls.update()
            renderer.render(scene, camera)
        }
        tick()

        return () => {
            disposed = true
            cancelAnimationFrame(frame)
            ro.disconnect()
            controls.dispose()
            scene.traverse(o => {
                const m = o as THREE.Mesh
                m.geometry?.dispose()
                const mat = m.material as THREE.Material | undefined
                mat?.dispose()
            })
            env.dispose()
            pmrem.dispose()
            renderer.dispose()
            renderer.domElement.remove()
            api.current = null
        }
    }, [body])

    useEffect(() => { api.current?.setSelected(selected) }, [selected])
    useEffect(() => { if (view) api.current?.goTo(view.name) }, [view])

    return (
        <div className={styles.wrap}>
            <div ref={host} className={styles.host} />
            {loading && <p className={styles.state}>Se încarcă mașina 3D…</p>}
            {failed && <p className={styles.state}>Modelul 3D nu s-a putut încărca. Folosește vederea 2D.</p>}
        </div>
    )
}
