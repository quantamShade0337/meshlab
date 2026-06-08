import type { Object3D } from "three";

/**
 * A non-reactive handle to the currently displayed editor model so the export
 * dialog and print panel can read the real geometry (THREE objects don't belong
 * in the serialisable store).
 */
export const exportTarget: { current: Object3D | null } = { current: null };

export function setExportTarget(object: Object3D | null) {
  exportTarget.current = object;
}
