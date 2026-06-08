import * as THREE from "three";

export interface BedPreset {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
}

export const BED_PRESETS: BedPreset[] = [
  { id: "ender3", name: "Ender 3 / Neo", x: 220, y: 220, z: 250 },
  { id: "prusa_mk4", name: "Prusa MK4", x: 250, y: 210, z: 220 },
  { id: "bambu_a1", name: "Bambu A1 / X1", x: 256, y: 256, z: 256 },
  { id: "bambu_mini", name: "Bambu A1 mini", x: 180, y: 180, z: 180 },
  { id: "custom", name: "Custom (200³)", x: 200, y: 200, z: 200 },
];

export interface PrintStats {
  /** Real-world bounding box in millimetres [x, y, z]. */
  dims: [number, number, number];
  triangles: number;
  volumeCm3: number;
  /** Filament mass at 100% infill (PLA), grams. */
  massSolidG: number;
  /** Rough mass at a typical 20% infill, grams. */
  massTypicalG: number;
  /** Filament length used at 100% infill (1.75mm), metres. */
  filamentM: number;
  /** Very rough print-time estimate, minutes. */
  minutes: number;
  /** Uniform scale factor applied to reach the target size. */
  scale: number;
}

const PLA_DENSITY = 1.24; // g/cm³
const FILAMENT_AREA = Math.PI * (1.75 / 2) ** 2; // mm²

/**
 * Measure a model's printable stats, scaled so its longest axis equals
 * `targetMm` millimetres. Volume is approximate for open/multi-part meshes.
 */
export function measurePrint(object: THREE.Object3D, targetMm: number): PrintStats {
  object.updateWorldMatrix(true, true);

  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z) || 1;
  const scale = targetMm / longest;

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  let volumeUnits = 0;
  let triangles = 0;

  object.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const geo = mesh.geometry as THREE.BufferGeometry;
    const pos = geo.attributes.position as THREE.BufferAttribute | undefined;
    if (!pos) return;
    const index = geo.index;
    const count = index ? index.count : pos.count;
    for (let i = 0; i < count; i += 3) {
      const i0 = index ? index.getX(i) : i;
      const i1 = index ? index.getX(i + 1) : i + 1;
      const i2 = index ? index.getX(i + 2) : i + 2;
      a.fromBufferAttribute(pos, i0).applyMatrix4(mesh.matrixWorld);
      b.fromBufferAttribute(pos, i1).applyMatrix4(mesh.matrixWorld);
      c.fromBufferAttribute(pos, i2).applyMatrix4(mesh.matrixWorld);
      volumeUnits += a.dot(b.clone().cross(c)) / 6;
      triangles++;
    }
  });

  const volMm3 = Math.abs(volumeUnits) * scale ** 3;
  const volumeCm3 = volMm3 / 1000;
  const massSolidG = volumeCm3 * PLA_DENSITY;
  // Walls + 20% infill ≈ shell (~35% of volume) + 0.2 of the rest.
  const massTypicalG = massSolidG * (0.35 + 0.65 * 0.2);
  const filamentM = volMm3 / FILAMENT_AREA / 1000;
  // Crude time model: ~3.5 min per gram of typical-infill plastic.
  const minutes = Math.max(2, Math.round(massTypicalG * 3.5));

  return {
    dims: [size.x * scale, size.y * scale, size.z * scale],
    triangles,
    volumeCm3,
    massSolidG,
    massTypicalG,
    filamentM,
    minutes,
    scale,
  };
}

export function fitsBed(dims: [number, number, number], bed: BedPreset) {
  // Allow the longest two footprint axes to map to the bed's X/Y.
  const foot = [dims[0], dims[2]].sort((p, q) => q - p);
  const bedXY = [bed.x, bed.y].sort((p, q) => q - p);
  return foot[0] <= bedXY[0] && foot[1] <= bedXY[1] && dims[1] <= bed.z;
}

export function formatMinutes(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
