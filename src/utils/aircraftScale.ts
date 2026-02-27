export function getAircraftScale(cameraDistance: number): number {
  const scale = cameraDistance * 0.00015 * SCALE;
  return Math.max(0.5, Math.min(scale, 20));
}

const SCALE = 4;