import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, Line, Vector3 } from 'three';

export const AltitudeLine = forwardRef<{ setPosition: (p: Vector3) => void }>(
  (_, ref) => {
    const lineRef = useRef<Line>(null);

    useImperativeHandle(ref, () => ({
      setPosition(p: Vector3) {
        if (!lineRef.current) return;
        const attr = lineRef.current.geometry.attributes.position;
        attr.setXYZ(0, p.x, 0, p.z);  // ground point
        attr.setXYZ(1, p.x, p.y, p.z); // aircraft point
        attr.needsUpdate = true;
      },
    }));

    const line = useMemo(() => {
      const geo = new BufferGeometry();
      geo.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
      const mat = new LineBasicMaterial({ color: 'teal', transparent: true, opacity: 1 });
      return new Line(geo, mat);
    }, []);

    return <primitive object={line} ref={lineRef} />;
  }
);