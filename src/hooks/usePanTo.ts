import { useRef, useCallback } from 'react';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export function usePanTo() {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const panTo = useCallback((x: number, y: number, z: number) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const targetPos = new Vector3(x, y, z);
    const currentTarget = controls.target.clone();
    const currentCamera = controls.object.position.clone();
    const offset = currentCamera.clone().sub(currentTarget); // maintain camera offset

    let start: number | null = null;
    const duration = 800; // ms

    function animate(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease out cubic

      controls!.target.lerpVectors(currentTarget, targetPos, eased);
      controls!.object.position.copy(controls!.target).add(offset);
      controls!.update();

      if (t < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, []);

  return { controlsRef, panTo };
}