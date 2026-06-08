"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { DepthMap } from "@/lib/depth/reconstruct";

const BASE = 1.5;

/** Footprint of the relief in world units, fit within a BASE×BASE box. */
export function reliefDims(depth: DepthMap, base = BASE) {
  const aspect = depth.width / depth.height;
  return aspect >= 1
    ? { w: base, h: base / aspect }
    : { w: base * aspect, h: base };
}

/** Decode an image to RGBA pixels at a target resolution (browser only). */
function decodePixels(url: string, w: number, h: number): Promise<Uint8ClampedArray> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no 2d context"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(ctx.getImageData(0, 0, w, h).data);
    };
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = url;
  });
}

/** Average colour of the image border — a good guess at the background. */
function estimateBackground(px: Uint8ClampedArray, w: number, h: number) {
  let r = 0, g = 0, b = 0, n = 0;
  const sx = Math.max(1, Math.floor(w / 64));
  const sy = Math.max(1, Math.floor(h / 64));
  const add = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    r += px[i];
    g += px[i + 1];
    b += px[i + 2];
    n++;
  };
  for (let x = 0; x < w; x += sx) { add(x, 0); add(x, h - 1); }
  for (let y = 0; y < h; y += sy) { add(0, y); add(w - 1, y); }
  return [r / n, g / n, b / n] as const;
}

export interface DepthReliefModelProps {
  depth: DepthMap;
  imageUrl: string;
  height?: number;
  segments?: number;
  cutBackground?: boolean;
  /** Mirror the depth to a back surface and seal the sides into a solid. */
  inferBack?: boolean;
  color?: string;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  flatShading?: boolean;
  wireframe?: boolean;
  textured?: boolean;
  onClick?: () => void;
}

/**
 * Builds a 3D mesh from a monocular depth map. The background is removed
 * (estimated from the image border) and, when a clean silhouette is found, the
 * depth is mirrored into a back surface with sealed side walls — a closed solid
 * with an *inferred* (symmetric) back you can orbit around. Falls back to a
 * single-sided relief when no clean silhouette is available.
 */
export function DepthReliefModel({
  depth,
  imageUrl,
  height = 0.45,
  segments = 220,
  cutBackground = true,
  inferBack = true,
  color = "#d4c9be",
  roughness = 0.8,
  metalness = 0.0,
  opacity = 1,
  flatShading = false,
  wireframe = false,
  textured = true,
  onClick,
}: DepthReliefModelProps) {
  const { w, h } = reliefDims(depth);

  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [pixels, setPixels] = useState<Uint8ClampedArray | null>(null);

  useEffect(() => {
    let active = true;
    new THREE.TextureLoader().load(imageUrl, (t) => {
      if (!active) return t.dispose();
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      setTex(t);
    });
    decodePixels(imageUrl, depth.width, depth.height)
      .then((p) => active && setPixels(p))
      .catch(() => active && setPixels(null));
    return () => {
      active = false;
    };
  }, [imageUrl, depth.width, depth.height]);

  const geometry = useMemo(() => {
    const aspect = depth.width / depth.height;
    const segX = aspect >= 1 ? segments : Math.max(8, Math.round(segments * aspect));
    const segY = aspect >= 1 ? Math.max(8, Math.round(segments / aspect)) : segments;
    const gridX = segX + 1;
    const gridY = segY + 1;
    const { data, width, height: dh } = depth;

    const bg = cutBackground && pixels ? estimateBackground(pixels, width, dh) : null;
    const THRESH = 48;

    // Per grid-vertex: world x/y, depth (0..1), foreground flag.
    const vx = new Float32Array(gridX * gridY);
    const vy = new Float32Array(gridX * gridY);
    const dval = new Float32Array(gridX * gridY);
    const fg = new Uint8Array(gridX * gridY);

    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const gi = iy * gridX + ix;
        const u = ix / segX;
        const v = iy / segY; // top → bottom
        vx[gi] = (u - 0.5) * w;
        vy[gi] = (0.5 - v) * h;
        const px = Math.min(width - 1, Math.max(0, Math.round(u * (width - 1))));
        const py = Math.min(dh - 1, Math.max(0, Math.round(v * (dh - 1))));
        dval[gi] = data[py * width + px] / 255;
        if (bg) {
          const pi = (py * width + px) * 4;
          const dr = pixels![pi] - bg[0];
          const dg = pixels![pi + 1] - bg[1];
          const db = pixels![pi + 2] - bg[2];
          fg[gi] = Math.sqrt(dr * dr + dg * dg + db * db) > THRESH ? 1 : 0;
        } else {
          fg[gi] = 1;
        }
      }
    }

    const cellFg = (ix: number, iy: number) =>
      ix >= 0 &&
      iy >= 0 &&
      ix < segX &&
      iy < segY &&
      !!(
        fg[iy * gridX + ix] &&
        fg[iy * gridX + ix + 1] &&
        fg[(iy + 1) * gridX + ix] &&
        fg[(iy + 1) * gridX + ix + 1]
      );

    let fgCells = 0;
    if (bg) {
      for (let iy = 0; iy < segY; iy++)
        for (let ix = 0; ix < segX; ix++) if (cellFg(ix, iy)) fgCells++;
    }
    const totalCells = segX * segY;
    const solid =
      inferBack && bg !== null && fgCells > totalCells * 0.02 && fgCells < totalCells * 0.99;

    // Two vertices per grid point: front (gi*2) and back (gi*2+1).
    const positions = new Float32Array(gridX * gridY * 2 * 3);
    const uvs = new Float32Array(gridX * gridY * 2 * 2);
    for (let gi = 0; gi < gridX * gridY; gi++) {
      const zf = dval[gi] * height;
      const zb = solid ? -dval[gi] * height : 0;
      positions[gi * 6 + 0] = vx[gi];
      positions[gi * 6 + 1] = vy[gi];
      positions[gi * 6 + 2] = zf;
      positions[gi * 6 + 3] = vx[gi];
      positions[gi * 6 + 4] = vy[gi];
      positions[gi * 6 + 5] = zb;
      const u = (gi % gridX) / segX;
      const v = Math.floor(gi / gridX) / segY;
      uvs[gi * 4 + 0] = u;
      uvs[gi * 4 + 1] = 1 - v;
      uvs[gi * 4 + 2] = u;
      uvs[gi * 4 + 3] = 1 - v;
    }
    const F = (gi: number) => gi * 2;
    const B = (gi: number) => gi * 2 + 1;

    const indices: number[] = [];
    for (let iy = 0; iy < segY; iy++) {
      for (let ix = 0; ix < segX; ix++) {
        if (!(solid ? cellFg(ix, iy) : bg ? cellFg(ix, iy) : true)) continue;
        const v00 = iy * gridX + ix;
        const v10 = v00 + 1;
        const v01 = v00 + gridX;
        const v11 = v01 + 1;
        // Front shell
        indices.push(F(v00), F(v01), F(v10), F(v01), F(v11), F(v10));
        if (solid) {
          // Back shell (reversed winding)
          indices.push(B(v00), B(v10), B(v01), B(v01), B(v10), B(v11));
        }
      }
    }

    if (solid) {
      const wall = (e0: number, e1: number) => {
        indices.push(F(e0), F(e1), B(e1), F(e0), B(e1), B(e0));
      };
      for (let iy = 0; iy < segY; iy++) {
        for (let ix = 0; ix < segX; ix++) {
          if (!cellFg(ix, iy)) continue;
          const v00 = iy * gridX + ix;
          const v10 = v00 + 1;
          const v01 = v00 + gridX;
          const v11 = v01 + 1;
          if (!cellFg(ix, iy - 1)) wall(v00, v10); // top
          if (!cellFg(ix, iy + 1)) wall(v01, v11); // bottom
          if (!cellFg(ix - 1, iy)) wall(v00, v01); // left
          if (!cellFg(ix + 1, iy)) wall(v10, v11); // right
        }
      }
    }

    // Degenerate cut → single-sided full plane fallback.
    const geo = new THREE.BufferGeometry();
    if (bg && !solid && indices.length < totalCells * 6 * 0.02) {
      for (let iy = 0; iy < segY; iy++) {
        for (let ix = 0; ix < segX; ix++) {
          const v00 = iy * gridX + ix;
          const v10 = v00 + 1;
          const v01 = v00 + gridX;
          const v11 = v01 + 1;
          indices.push(F(v00), F(v01), F(v10), F(v01), F(v11), F(v10));
        }
      }
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [depth, w, h, height, segments, cutBackground, inferBack, pixels]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const showTexture = textured && !wireframe;

  return (
    <mesh
      geometry={geometry}
      position={[0, h / 2, 0]}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        map={showTexture ? tex ?? undefined : undefined}
        color={showTexture ? "#ffffff" : color}
        roughness={roughness}
        metalness={metalness}
        wireframe={wireframe}
        transparent={opacity < 1}
        opacity={opacity}
        flatShading={flatShading}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
