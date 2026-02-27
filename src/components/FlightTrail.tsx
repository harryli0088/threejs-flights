import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, Line } from 'three';

interface FlightTrailProps {
  points: [number, number, number][];
  color: string;
}

export function FlightTrail({ points, color }: FlightTrailProps) {
  const line = useMemo(() => {
    if (points.length < 2) return null;
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(points.flat(), 3));
    const mat = new LineBasicMaterial({ color, transparent: true, opacity: 0.4 });
    return new Line(geo, mat);
  }, [points, color]);

  if (!line) return null;
  return <primitive object={line} />;
}