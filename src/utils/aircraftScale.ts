export function getAircraftScale(cameraDistance: number): number {
  const scale = cameraDistance * 0.0003;
  return Math.max(0.5, Math.min(scale, 20));
}