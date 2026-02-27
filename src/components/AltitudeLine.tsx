import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, Line } from 'three';

export function AltitudeLine({ geoRef }: { geoRef: React.RefObject<BufferGeometry | null> }) {
  const line = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute([0,0,0,0,0,0], 3));
    return new Line(geo, new LineBasicMaterial({ color: '#fff' }));
  }, []);

  return <primitive object={line} ref={(obj: Line) => { if (obj) (geoRef as any).current = obj.geometry; }} />;
}