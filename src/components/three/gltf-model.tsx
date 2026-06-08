"use client";

import { Component, useEffect, useMemo, type ReactNode } from "react";
import { useGLTF, Edges } from "@react-three/drei";
import * as THREE from "three";

interface GltfModelProps {
  url: string;
  wireframe?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

function GltfModelInner({ url, wireframe = false, selected = false, onClick }: GltfModelProps) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  const { scale, center, size } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const s = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(s.x, s.y, s.z) || 1;
    return { scale: 1.4 / maxDim, center: c, size: s };
  }, [cloned]);

  useEffect(() => {
    cloned.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
          if (m && "wireframe" in m) (m as THREE.MeshStandardMaterial).wireframe = wireframe;
        }
      }
    });
  }, [cloned, wireframe]);

  return (
    <group position={[0, (size.y * scale) / 2, 0]} scale={scale} onClick={onClick}>
      <primitive object={cloned} position={[-center.x, -center.y, -center.z]} />
      {selected && (
        <mesh raycast={() => null}>
          <boxGeometry args={[size.x * 1.03, size.y * 1.03, size.z * 1.03]} />
          <meshBasicMaterial visible={false} />
          <Edges color="#0070f3" />
        </mesh>
      )}
    </group>
  );
}

/** Keeps a malformed GLB from taking down the whole R3F canvas. */
class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function GltfModel(props: GltfModelProps & { fallback?: ReactNode }) {
  const { fallback = null, ...rest } = props;
  return (
    <ModelErrorBoundary fallback={fallback}>
      <GltfModelInner {...rest} />
    </ModelErrorBoundary>
  );
}
