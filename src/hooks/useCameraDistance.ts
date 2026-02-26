import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';

export function useCameraDistance(): number {
  const { camera } = useThree();
  const [distance, setDistance] = useState(camera.position.length());
  const frameCount = useRef(0);

  useFrame(() => {
    // Only update every 10 frames for performance
    frameCount.current++;
    if (frameCount.current % 10 === 0) {
      setDistance(camera.position.length());
    }
  });

  return distance;
}