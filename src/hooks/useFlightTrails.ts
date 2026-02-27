import { useRef } from 'react';

const MAX_TRAIL_POINTS = 20;
export type TrailMap = Map<string, [number, number, number][]>;

export function useFlightTrails() {
  const trailsRef = useRef<TrailMap>(new Map());

  function addPoint(icao: string, position: [number, number, number]) {
    const trail = trailsRef.current.get(icao) ?? [];
    const last = trail[trail.length - 1];
    // Minimum distance threshold to avoid duplicate points
    if (last) {
      const dx = position[0] - last[0];
      const dz = position[2] - last[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 50) return; // less than 50m, skip
    }
    trail.push([...position]);
    if (trail.length > MAX_TRAIL_POINTS) trail.shift();
    trailsRef.current.set(icao, trail);
  }

  function getTrails(): TrailMap {
    return trailsRef.current;
  }

  return { addPoint, getTrails };
}