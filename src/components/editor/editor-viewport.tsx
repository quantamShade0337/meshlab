"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Grid,
  TransformControls,
  GizmoHelper,
  GizmoViewcube,
  Edges,
} from "@react-three/drei";
import { useEditorStore } from "@/stores/editor-store";
import { ChairModel } from "@/components/three/chair-model";
import { DepthReliefModel, reliefDims } from "@/components/three/depth-relief-model";
import { GltfModel } from "@/components/three/gltf-model";
import { LithophaneModel } from "@/components/three/lithophane-model";
import { useDepthReconstruction } from "@/lib/depth/use-depth";
import { setExportTarget } from "@/lib/editor/export-target";
import * as THREE from "three";

type OrbitLike = { target: THREE.Vector3; update: () => void } | null;

const VIEW_DIRS: Record<string, [number, number, number]> = {
  front: [0, 0, 1],
  back: [0, 0, -1],
  left: [-1, 0, 0],
  right: [1, 0, 0],
  top: [0, 1, 0.0001],
  bottom: [0, -1, 0.0001],
  persp: [1, 0.8, 1],
};

/** Animates the camera to framed / axis views in response to view requests. */
function CameraRig({ modelObj }: { modelObj: THREE.Object3D | null }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitLike;
  const viewRequest = useEditorStore((s) => s.viewRequest);
  const lastNonce = useRef(0);
  const goal = useRef<{ pos: THREE.Vector3; tgt: THREE.Vector3 } | null>(null);

  useEffect(() => {
    if (!viewRequest || viewRequest.nonce === lastNonce.current) return;
    lastNonce.current = viewRequest.nonce;

    const box = new THREE.Box3();
    if (modelObj) box.setFromObject(modelObj);
    else box.set(new THREE.Vector3(-0.5, 0, -0.5), new THREE.Vector3(0.5, 1, 0.5));
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z, 0.5) * 0.5;
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 38;
    const dist = (radius / Math.sin(((fov / 2) * Math.PI) / 180)) * 1.6;

    let dir: THREE.Vector3;
    if (viewRequest.view === "frame") {
      dir = camera.position.clone().sub(controls?.target ?? center);
      if (dir.lengthSq() < 1e-6) dir = new THREE.Vector3(1, 0.8, 1);
      dir.normalize();
    } else {
      dir = new THREE.Vector3(...(VIEW_DIRS[viewRequest.view] ?? VIEW_DIRS.persp)).normalize();
    }

    goal.current = { pos: center.clone().add(dir.multiplyScalar(dist)), tgt: center };
  }, [viewRequest, modelObj, camera, controls]);

  useFrame(() => {
    if (!goal.current) return;
    camera.position.lerp(goal.current.pos, 0.18);
    if (controls) {
      controls.target.lerp(goal.current.tgt, 0.18);
      controls.update();
    }
    if (camera.position.distanceTo(goal.current.pos) < 0.02) goal.current = null;
  });

  return null;
}

/** Reports FPS + triangle count roughly twice a second. */
function PerfTracker({ onUpdate }: { onUpdate: (s: { fps: number; tris: number }) => void }) {
  const gl = useThree((s) => s.gl);
  const acc = useRef({ t: 0, frames: 0 });
  useFrame((_, delta) => {
    const a = acc.current;
    a.t += delta;
    a.frames += 1;
    if (a.t >= 0.5) {
      onUpdate({ fps: Math.round(a.frames / a.t), tris: gl.info.render.triangles });
      a.t = 0;
      a.frames = 0;
    }
  });
  return null;
}

const MODE: Record<string, "translate" | "rotate" | "scale"> = {
  move: "translate",
  rotate: "rotate",
  scale: "scale",
};

export function EditorViewport() {
  const transform = useEditorStore((s) => s.transform);
  const material = useEditorStore((s) => s.material);
  const scene = useEditorStore((s) => s.scene);
  const nodeVisible = useEditorStore((s) => s.nodeVisible);
  const setSelectedNode = useEditorStore((s) => s.setSelectedNode);
  const selectedNode = useEditorStore((s) => s.selectedNode);
  const activeTool = useEditorStore((s) => s.activeTool);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const setTransformLive = useEditorStore((s) => s.setTransformLive);
  const sourceImage = useEditorStore((s) => s.sourceImage);
  const reliefHeight = useEditorStore((s) => s.reliefHeight);
  const modelUrl = useEditorStore((s) => s.modelUrl);
  const lithophane = useEditorStore((s) => s.lithophane);
  const litho = useEditorStore((s) => s.litho);
  const targetMm = useEditorStore((s) => s.targetMm);

  const isLitho = Boolean(!modelUrl && lithophane && sourceImage);
  const { depth, status, message } = useDepthReconstruction(
    modelUrl || lithophane ? null : sourceImage,
  );
  const isRelief = Boolean(!modelUrl && !lithophane && sourceImage && depth);

  const [modelObj, setModelObj] = useState<THREE.Object3D | null>(null);
  const [stats, setStats] = useState({ fps: 0, tris: 0 });

  // Expose the live model group for the export dialog / print panel.
  useEffect(() => {
    setExportTarget(modelObj);
    return () => setExportTarget(null);
  }, [modelObj]);

  // Selection bounding box adapts to whichever model is shown.
  const reliefBox = isRelief && depth ? reliefDims(depth) : null;
  const selBoxArgs: [number, number, number] = reliefBox
    ? [reliefBox.w * 1.03, reliefBox.h * 1.03, reliefHeight + 0.12]
    : [0.98, 1.06, 0.92];
  const selBoxPos: [number, number, number] = reliefBox
    ? [0, reliefBox.h / 2, reliefHeight / 2]
    : [0, 0.5, 0];

  const posRad = transform.rotation.map((d) => (d * Math.PI) / 180) as [
    number,
    number,
    number,
  ];

  const showGizmo =
    nodeVisible && selectedNode === "chair" && activeTool !== "select";

  const syncFromObject = () => {
    if (!modelObj) return;
    setTransformLive({
      position: [modelObj.position.x, modelObj.position.y, modelObj.position.z],
      rotation: [
        THREE.MathUtils.radToDeg(modelObj.rotation.x),
        THREE.MathUtils.radToDeg(modelObj.rotation.y),
        THREE.MathUtils.radToDeg(modelObj.rotation.z),
      ],
      scale: [modelObj.scale.x, modelObj.scale.y, modelObj.scale.z],
    });
  };

  return (
    <>
      <Canvas
        shadows={scene.shadows ? "basic" : false}
        camera={{ position: [2.5, 2, 2.5], fov: 38 }}
        className="w-full h-full"
        onPointerMissed={() => setSelectedNode(null)}
      >
        <color attach="background" args={[scene.background]} />

        <ambientLight intensity={scene.envIntensity * 0.6} />
        <directionalLight
          position={[4, 8, 4]}
          intensity={scene.envIntensity * 1.2}
          castShadow={scene.shadows}
          shadow-mapSize={[1024, 1024]}
        />
        <Environment
          preset={scene.envPreset}
          environmentIntensity={scene.envIntensity * 0.4}
        />

        {nodeVisible && (
          <group
            ref={setModelObj}
            position={transform.position}
            rotation={posRad}
            scale={transform.scale}
          >
            {modelUrl ? (
              <Suspense fallback={null}>
                <GltfModel
                  url={modelUrl}
                  wireframe={scene.wireframe}
                  selected={selectedNode === "chair"}
                  onClick={() => setSelectedNode("chair")}
                />
              </Suspense>
            ) : isLitho && sourceImage ? (
              <LithophaneModel
                imageUrl={sourceImage}
                widthMm={targetMm}
                minMm={litho.minMm}
                maxMm={litho.maxMm}
                frame={litho.frame}
                invert={litho.invert}
                wireframe={scene.wireframe}
                onClick={() => setSelectedNode("chair")}
              />
            ) : isRelief && depth && sourceImage ? (
              <DepthReliefModel
                depth={depth}
                imageUrl={sourceImage}
                height={reliefHeight}
                color={material.color}
                roughness={material.roughness}
                metalness={material.metalness}
                opacity={material.opacity}
                flatShading={material.flatShading}
                wireframe={scene.wireframe}
                onClick={() => setSelectedNode("chair")}
              />
            ) : (
              <ChairModel
                color={material.color}
                roughness={material.roughness}
                metalness={material.metalness}
                opacity={material.opacity}
                flatShading={material.flatShading}
                wireframe={scene.wireframe}
                onClick={() => setSelectedNode("chair")}
              />
            )}
            {/* GLB/lithophane render their own bounds; chair/relief use this box. */}
            {selectedNode === "chair" && !modelUrl && !isLitho && (
              <mesh position={selBoxPos} raycast={() => null}>
                <boxGeometry args={selBoxArgs} />
                <meshBasicMaterial visible={false} />
                <Edges color="#0070f3" />
              </mesh>
            )}
          </group>
        )}

        {showGizmo && modelObj && (
          <TransformControls
            object={modelObj}
            mode={MODE[activeTool]}
            translationSnap={scene.snap ? 0.25 : undefined}
            rotationSnap={scene.snap ? Math.PI / 12 : undefined}
            scaleSnap={scene.snap ? 0.1 : undefined}
            onMouseDown={pushHistory}
            onObjectChange={syncFromObject}
          />
        )}

        {scene.ground && (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            receiveShadow
          >
            <planeGeometry args={[20, 20]} />
            <shadowMaterial opacity={0.18} />
          </mesh>
        )}

        {scene.grid && (
          <Grid
            position={[0, -0.01, 0]}
            args={[20, 20]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor={new THREE.Color("#3a3a3a")}
            sectionSize={2}
            sectionThickness={1}
            sectionColor={new THREE.Color("#0070f3")}
            fadeDistance={16}
            fadeStrength={1.2}
            infiniteGrid
          />
        )}

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          autoRotate={scene.autoRotate}
          autoRotateSpeed={1.2}
        />
        <CameraRig modelObj={modelObj} />

        <GizmoHelper alignment="bottom-right" margin={[64, 84]}>
          <GizmoViewcube
            color="#252525"
            textColor="#ccc"
            strokeColor="#3a3a3a"
            hoverColor="#0070f3"
          />
        </GizmoHelper>

        {scene.stats && <PerfTracker onUpdate={setStats} />}
      </Canvas>

      {scene.stats && (
        <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-2 rounded-md border border-[#2a2a2a] bg-[#1a1a1a]/85 px-2 py-1 font-mono text-[10px] text-[#888] backdrop-blur-sm">
          <span className={stats.fps >= 50 ? "text-[#4ade80]" : stats.fps >= 30 ? "text-[#facc15]" : "text-[#f87171]"}>
            {stats.fps} fps
          </span>
          <span className="text-[#3a3a3a]">·</span>
          <span>{stats.tris.toLocaleString()} tris</span>
          {modelUrl ? (
            <>
              <span className="text-[#3a3a3a]">·</span>
              <span className="text-[#0070f3]">full 360° model</span>
            </>
          ) : isLitho ? (
            <>
              <span className="text-[#3a3a3a]">·</span>
              <span className="text-[#0070f3]">lithophane</span>
            </>
          ) : isRelief ? (
            <>
              <span className="text-[#3a3a3a]">·</span>
              <span className="text-[#0070f3]">depth relief</span>
            </>
          ) : null}
        </div>
      )}

      {/* On-device reconstruction status */}
      {sourceImage && !modelUrl && !lithophane && status !== "ready" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]/90 px-5 py-4 text-center backdrop-blur-sm">
            {status === "error" ? (
              <p className="text-[12px] text-red-400">{message || "Reconstruction failed."}</p>
            ) : (
              <>
                <div className="mx-auto mb-2.5 h-5 w-5 animate-spin rounded-full border-2 border-[#333] border-t-[#0070f3]" />
                <p className="text-[12px] text-[#ccc]">{message || "Reconstructing…"}</p>
                <p className="mt-1 font-mono text-[10px] text-[#666]">
                  on-device · first run downloads the model (~50 MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
