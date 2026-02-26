import { useGLTF } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { Box3, Group, Vector3 } from 'three';
import type { Flight } from '../utils/fetchOpenSkyAircraftData';

// Preload so it doesn't hitch on first render
useGLTF.preload('/737/737.glb');

interface AircraftProps {
  flight: Flight;
  scale: number;
}

const TARGET_LENGTH = 60; // meters — real 737 is ~40m, tune this

export function Aircraft({ flight, scale }: AircraftProps) {
  const { scene } = useGLTF('/737/737.glb');

  const { cloned, normalizedScale } = useMemo(() => {
    const cloned = scene.clone();

    // Measure the model's bounding box
    const box = new Box3().setFromObject(cloned);
    const size = new Vector3();
    box.getSize(size);

    // Use the longest dimension (usually length) to normalize
    const longest = Math.max(size.x, size.y, size.z);
    const normalizedScale = TARGET_LENGTH / longest;

    return { cloned, normalizedScale };
  }, [scene]);

  return (
    <group
      position={flight.position}
      rotation={[0, -(flight.heading * Math.PI) / 180, 0]}
      scale={normalizedScale * scale} // scale from useCameraDistance on top
    >
      <primitive object={cloned} />
    </group>
  );
}