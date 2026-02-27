import { useGLTF } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { Box3, BufferGeometry, Group, MathUtils, Vector3 } from 'three';
import type { TrackedFlight } from '../hooks/useFlights';
import { useFrame } from '@react-three/fiber';
import { AltitudeLine } from './AltitudeLine';

// Preload so it doesn't hitch on first render
useGLTF.preload('/737/737.glb');

const TARGET_LENGTH = 60;

interface AircraftProps {
  flight: TrackedFlight;
  scale: number;
  onClick?: (flight: TrackedFlight) => void;
  onPointerOver?: (flight: TrackedFlight) => void;
  onPointerOut?: () => void;
}

export function Aircraft({ flight, scale, onClick, onPointerOver, onPointerOut }: AircraftProps) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/737/737.glb');

  const trailGeoRef = useRef<BufferGeometry>(null);

  const altLineRef = useRef<{ setPosition: (p: Vector3) => void }>(null);
  const _vec = useMemo(() => new Vector3(), []); // reuse to avoid allocation

  const { cloned, normalizedScale } = useMemo(() => {
    const cloned = scene.clone();
    const box = new Box3().setFromObject(cloned);
    const size = new Vector3();
    box.getSize(size);
    const longest = Math.max(size.x, size.y, size.z);
    return { cloned, normalizedScale: TARGET_LENGTH / longest };
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    flight.lerpT = Math.min(flight.lerpT + delta / 10, 1);
    const t = flight.lerpT;

    const x = MathUtils.lerp(flight.prevPosition[0], flight.targetPosition[0], t);
    const y = MathUtils.lerp(flight.prevPosition[1], flight.targetPosition[1], t);
    const z = MathUtils.lerp(flight.prevPosition[2], flight.targetPosition[2], t);

    groupRef.current.position.set(x, y, z);
    // update altitude line with same interpolated position
    altLineRef.current?.setPosition(_vec.set(x, y, z));

    let dh = flight.targetHeading - flight.prevHeading;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    const heading = flight.prevHeading + dh * t;
    groupRef.current.rotation.y = -(heading * Math.PI) / 180;

    if (trailGeoRef.current) {
      const attr = trailGeoRef.current.attributes.position;
      // tail: where we started
      attr.setXYZ(0, flight.prevPosition[0], flight.prevPosition[1], flight.prevPosition[2]);
      // head: where we are now
      attr.setXYZ(1, x, y, z);
      attr.needsUpdate = true;
    }
  });

  return (
    <>
      <group
        ref={groupRef}
        scale={normalizedScale * scale}
        onClick={() => onClick?.(flight)}
        onPointerOver={() => onPointerOver?.(flight)}
        onPointerOut={() => onPointerOut?.()}
      >
        <mesh visible={false}>
          <sphereGeometry args={[15, 8, 8]} />
          <meshBasicMaterial />
        </mesh>
        <group rotation={[0, Math.PI, 0]}>
          <primitive object={cloned} />
        </group>
      </group>

      {!flight.onGround && (
        <line>
          <bufferGeometry ref={trailGeoRef}>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(6), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ccff" transparent opacity={0.4} />
        </line>
      )}

      {!flight.onGround && <AltitudeLine ref={altLineRef} />}
    </>
  );
}