"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group } from "three";

const DEFAULT_COLOR = "#d4c9be";
const DEFAULT_ROUGHNESS = 0.85;

interface MatProps {
  color: string;
  roughness: number;
  metalness: number;
  wireframe: boolean;
  opacity: number;
  flatShading: boolean;
}

function Arch({
  position,
  legSpread = 0.34,
  legHeight = 0.72,
  radius = 0.11,
  mat,
}: {
  position: [number, number, number];
  legSpread?: number;
  legHeight?: number;
  radius?: number;
  mat: MatProps;
}) {
  const matProps = {
    color: mat.color,
    roughness: mat.roughness,
    metalness: mat.metalness,
    wireframe: mat.wireframe,
    transparent: mat.opacity < 1,
    opacity: mat.opacity,
    flatShading: mat.flatShading,
  };
  return (
    <group position={position}>
      <mesh position={[-legSpread, legHeight / 2, 0]} castShadow>
        <capsuleGeometry args={[radius, legHeight, 8, 20]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      <mesh position={[legSpread, legHeight / 2, 0]} castShadow>
        <capsuleGeometry args={[radius, legHeight, 8, 20]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      <mesh
        position={[0, legHeight + radius, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <capsuleGeometry args={[radius, legSpread * 2 - radius * 0.5, 8, 20]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
    </group>
  );
}

export interface ChairModelProps {
  autoRotate?: boolean;
  color?: string;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  flatShading?: boolean;
  wireframe?: boolean;
  onClick?: () => void;
}

export function ChairModel({
  autoRotate = false,
  color = DEFAULT_COLOR,
  roughness = DEFAULT_ROUGHNESS,
  metalness = 0.0,
  opacity = 1,
  flatShading = false,
  wireframe = false,
  onClick,
}: ChairModelProps) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  const mat: MatProps = { color, roughness, metalness, wireframe, opacity, flatShading };
  const matProps = {
    color,
    roughness,
    metalness,
    wireframe,
    transparent: opacity < 1,
    opacity,
    flatShading,
  };

  return (
    <group ref={groupRef} rotation={[0, -0.4, 0]} onClick={onClick}>
      <Arch position={[0, 0, 0.36]} mat={mat} />
      <Arch position={[0, 0, -0.36]} mat={mat} />
      <mesh position={[0, 0.64, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.78, 0.1, 0.56]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      <mesh position={[0, 0.64, 0.28]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.05, 0.68, 6, 12]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      <mesh position={[0, 0.64, -0.28]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.05, 0.68, 6, 12]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
    </group>
  );
}
