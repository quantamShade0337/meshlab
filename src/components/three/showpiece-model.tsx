"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import {
  type Group,
  type MeshStandardMaterial,
  type MeshBasicMaterial,
  MathUtils,
} from "three";

export type ProgressRef = { current: number };

const LEG_H = 0.72;
const RADIUS = 0.11;
const SPREAD = 0.34;

type Variant = "solid" | "wire";

function SolidMat({ matRef }: { matRef: (m: MeshStandardMaterial | null) => void }) {
  return (
    <meshStandardMaterial
      ref={matRef}
      color="#3f3f46"
      roughness={0.45}
      metalness={0.2}
      transparent
      opacity={0.25}
    />
  );
}

function WireMat({ matRef }: { matRef: (m: MeshBasicMaterial | null) => void }) {
  return (
    <meshBasicMaterial ref={matRef} color="#0070f3" wireframe transparent opacity={0.9} />
  );
}

/** The arc-chair geometry painted in one of two materials. */
function ChairForm({
  variant,
  register,
}: {
  variant: Variant;
  register: (m: MeshStandardMaterial | MeshBasicMaterial | null) => void;
}) {
  const mat =
    variant === "solid" ? (
      <SolidMat matRef={register} />
    ) : (
      <WireMat matRef={register} />
    );

  return (
    <group>
      {/* two arches */}
      {[0.36, -0.36].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[-SPREAD, LEG_H / 2, 0]} castShadow>
            <capsuleGeometry args={[RADIUS, LEG_H, 10, 24]} />
            {mat}
          </mesh>
          <mesh position={[SPREAD, LEG_H / 2, 0]} castShadow>
            <capsuleGeometry args={[RADIUS, LEG_H, 10, 24]} />
            {mat}
          </mesh>
          <mesh position={[0, LEG_H + RADIUS, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[RADIUS, SPREAD * 2 - RADIUS * 0.5, 10, 24]} />
            {mat}
          </mesh>
        </group>
      ))}
      {/* seat */}
      <mesh position={[0, 0.64, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.78, 0.1, 0.56]} />
        {mat}
      </mesh>
      {/* back rails */}
      <mesh position={[0, 0.64, 0.28]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.05, 0.68, 8, 16]} />
        {mat}
      </mesh>
      <mesh position={[0, 0.64, -0.28]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.05, 0.68, 8, 16]} />
        {mat}
      </mesh>
    </group>
  );
}

/**
 * Showpiece chair. `progressRef` (0→1, driven by page scroll) controls rotation
 * sweep, scale, and the crossfade from a blue wireframe scaffold → solid
 * surface — visualising "image → editable mesh". Idle-rotates so it's alive.
 */
export function ShowpieceModel({
  progressRef,
  interactive = false,
}: {
  progressRef?: ProgressRef;
  interactive?: boolean;
}) {
  const group = useRef<Group>(null);
  const solidMats = useRef<MeshStandardMaterial[]>([]);
  const wireMats = useRef<MeshBasicMaterial[]>([]);
  const smoothed = useRef(0);
  const spin = useRef(0);

  const registerSolid = (m: MeshStandardMaterial | MeshBasicMaterial | null) => {
    const mat = m as MeshStandardMaterial | null;
    if (mat && !solidMats.current.includes(mat)) solidMats.current.push(mat);
  };
  const registerWire = (m: MeshStandardMaterial | MeshBasicMaterial | null) => {
    const mat = m as MeshBasicMaterial | null;
    if (mat && !wireMats.current.includes(mat)) wireMats.current.push(mat);
  };

  useFrame((_, delta) => {
    // Sanitise the scroll-driven target: never NaN, always within [0, 1].
    let target = progressRef ? progressRef.current : 1;
    if (!Number.isFinite(target)) target = 0;
    target = Math.min(1, Math.max(0, target));

    const d = Number.isFinite(delta) ? Math.min(delta, 0.1) : 0.016;
    smoothed.current = MathUtils.damp(smoothed.current, target, 4, d);
    if (!Number.isFinite(smoothed.current)) smoothed.current = target;
    const p = smoothed.current;

    spin.current += d * (interactive ? 0.15 : 0.35);

    if (group.current) {
      group.current.rotation.y = spin.current + p * Math.PI * 1.1 - 0.4;
      group.current.scale.setScalar(MathUtils.lerp(0.92, 1.08, p));
    }

    // Crossfade wireframe → solid, but always keep both readable so the model
    // can never fully disappear at any scroll position.
    const build = MathUtils.smoothstep(p, 0.05, 0.85);
    for (const m of solidMats.current) m.opacity = Math.max(build, 0.25);
    for (const m of wireMats.current) m.opacity = (1 - build) * 0.85 + 0.15;
  });

  return (
    <Float speed={1.4} rotationIntensity={interactive ? 0 : 0.25} floatIntensity={0.5}>
      <group ref={group} position={[0, -0.55, 0]}>
        <ChairForm variant="solid" register={registerSolid} />
        <group scale={1.004}>
          <ChairForm variant="wire" register={registerWire} />
        </group>
      </group>
    </Float>
  );
}
