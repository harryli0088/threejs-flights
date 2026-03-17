import { BufferGeometry, LineBasicMaterial } from 'three';
import React from 'react';

export const sharedLineMaterial = new LineBasicMaterial({ color: '#fff' });

export function AltitudeLine({ geoRef }: { geoRef: React.RefObject<BufferGeometry | null> }) {
  return (
    <line>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(6), 3]} // two points (start/end)
        />
      </bufferGeometry>
      <primitive object={sharedLineMaterial} attach="material" />
    </line>
  );
}