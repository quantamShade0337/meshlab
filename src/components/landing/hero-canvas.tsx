"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { ShowpieceModel, type ProgressRef } from "@/components/three/showpiece-model";

export default function HeroCanvas({
  progressRef,
}: {
  progressRef: ProgressRef;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.7, 4.3], fov: 38 }}
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[5, 7, 4]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 2, -3]} intensity={0.6} color="#7928ca" />
      <pointLight position={[3, -2, 4]} intensity={0.5} color="#00dfd8" />

      <ShowpieceModel progressRef={progressRef} />

      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.32}
        scale={9}
        blur={2.8}
        far={4}
      />
    </Canvas>
  );
}
