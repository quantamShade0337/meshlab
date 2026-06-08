"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

const BASE = 1.5;

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

export interface LithophaneModelProps {
  imageUrl: string;
  /** Real-world longest-side size (mm) — matches the export target size. */
  widthMm: number;
  minMm?: number;
  maxMm?: number;
  frame?: boolean;
  invert?: boolean;
  color?: string;
  roughness?: number;
  metalness?: number;
  wireframe?: boolean;
  onClick?: () => void;
}

/**
 * A printable lithophane: a flat-backed rectangular panel whose front thickness
 * encodes image brightness (dark = thick, bright = thin) so it reveals the
 * photo when backlit. Built in normalised units with thickness scaled to the
 * export target, so the exported STL has true min/max thickness in millimetres.
 */
export function LithophaneModel({
  imageUrl,
  widthMm,
  minMm = 0.8,
  maxMm = 3,
  frame = true,
  invert = false,
  color = "#e8e8e8",
  roughness = 0.65,
  metalness = 0,
  wireframe = false,
  onClick,
}: LithophaneModelProps) {
  const [pixels, setPixels] = useState<{ data: Uint8ClampedArray; w: number; h: number } | null>(
    null,
  );

  // Sample the image at a print-appropriate resolution (~0.3 mm/pixel).
  const sampleW = useMemo(() => Math.max(64, Math.min(360, Math.round(widthMm / 0.3))), [widthMm]);

  useEffect(() => {
    let active = true;
    const probe = new Image();
    probe.crossOrigin = "anonymous";
    probe.onload = () => {
      const aspect = probe.width / probe.height || 1;
      const w = sampleW;
      const h = Math.max(64, Math.round(sampleW / aspect));
      decodePixels(imageUrl, w, h)
        .then((data) => active && setPixels({ data, w, h }))
        .catch(() => active && setPixels(null));
    };
    probe.onerror = () => active && setPixels(null);
    probe.src = imageUrl;
    return () => {
      active = false;
    };
  }, [imageUrl, sampleW]);

  const geometry = useMemo(() => {
    if (!pixels) return null;
    const { data, w: iw, h: ih } = pixels;
    const aspect = iw / ih;
    const Wu = aspect >= 1 ? BASE : BASE * aspect;
    const Hu = aspect >= 1 ? BASE / aspect : BASE;
    const mmPerUnit = widthMm / BASE;
    const minU = minMm / mmPerUnit;
    const maxU = maxMm / mmPerUnit;
    const frameU = frame ? Math.min(Wu, Hu) * 0.5 * (4 / Math.max(widthMm, 1)) + 3 / mmPerUnit : 0;

    const segX = iw - 1;
    const segY = ih - 1;
    const gridX = iw;
    const gridY = ih;

    const lum = (i: number) =>
      (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;

    const positions = new Float32Array(gridX * gridY * 2 * 3);
    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const gi = iy * gridX + ix;
        const x = (ix / segX - 0.5) * Wu;
        const y = (0.5 - iy / segY) * Hu;
        const l = lum(gi);
        const t = invert ? l : 1 - l; // dark → thick
        let zf = minU + t * (maxU - minU);

        if (frame) {
          const dx = Math.min(ix, segX - ix) / segX * Wu;
          const dy = Math.min(iy, segY - iy) / segY * Hu;
          if (Math.min(dx, dy) < frameU) zf = maxU;
        }

        positions[gi * 6] = x;
        positions[gi * 6 + 1] = y;
        positions[gi * 6 + 2] = zf;
        positions[gi * 6 + 3] = x;
        positions[gi * 6 + 4] = y;
        positions[gi * 6 + 5] = 0; // flat back
      }
    }

    const F = (gi: number) => gi * 2;
    const B = (gi: number) => gi * 2 + 1;
    const indices: number[] = [];

    for (let iy = 0; iy < segY; iy++) {
      for (let ix = 0; ix < segX; ix++) {
        const v00 = iy * gridX + ix;
        const v10 = v00 + 1;
        const v01 = v00 + gridX;
        const v11 = v01 + 1;
        indices.push(F(v00), F(v01), F(v10), F(v01), F(v11), F(v10)); // front
        indices.push(B(v00), B(v10), B(v01), B(v01), B(v10), B(v11)); // back
      }
    }

    const wall = (e0: number, e1: number) => {
      indices.push(F(e0), F(e1), B(e1), F(e0), B(e1), B(e0));
    };
    for (let ix = 0; ix < segX; ix++) {
      wall(ix, ix + 1); // top
      wall(segY * gridX + ix + 1, segY * gridX + ix); // bottom
    }
    for (let iy = 0; iy < segY; iy++) {
      wall((iy + 1) * gridX, iy * gridX); // left
      wall(iy * gridX + segX, (iy + 1) * gridX + segX); // right
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [pixels, widthMm, minMm, maxMm, frame, invert]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  if (!geometry) return null;

  // Position so the flat back sits on the ground plane, panel standing upright.
  const aspect = pixels ? pixels.w / pixels.h : 1;
  const Hu = aspect >= 1 ? BASE / aspect : BASE;

  return (
    <mesh geometry={geometry} position={[0, Hu / 2, 0]} onClick={onClick} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        wireframe={wireframe}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
