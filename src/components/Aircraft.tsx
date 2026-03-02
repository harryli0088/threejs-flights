import { useGLTF } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { Box3, BufferGeometry, Group, MathUtils, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { AltitudeLine } from './AltitudeLine';
import type { Flight } from '../utils/fetchOpenSkyAircraftData';
import { POLL_INTERVAL_S } from '../hooks/useFetchData';

const MODEL_PATH = `${import.meta.env.BASE_URL}737/737.glb`;

// Preload so it doesn't hitch on first render
useGLTF.preload(MODEL_PATH);

const TARGET_LENGTH = 60;

interface AircraftProps {
  flight: Flight;
  scale: number;
  onClick?: (flight: Flight) => void;
  onPointerOver?: (flight: Flight) => void;
  onPointerOut?: () => void;
}

export function Aircraft({ flight, scale, onClick, onPointerOver, onPointerOut }: AircraftProps) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_PATH);

  const trailGeoRef = useRef<BufferGeometry>(null);

  const altitudeGeoRef = useRef<BufferGeometry>(null);

  const { cloned, normalizedScale } = useMemo(() => {
    const cloned = scene.clone();
    const box = new Box3().setFromObject(cloned);
    const size = new Vector3();
    box.getSize(size);
    const longest = Math.max(size.x, size.y, size.z);
    return { cloned, normalizedScale: TARGET_LENGTH / longest };
  }, [scene]);

  useFrame((_, delta) => {
    const current = flight.history.at(0);
    const prev = flight.history.at(1) || current;

    if (!groupRef.current || !current || !prev) return;

    flight.lerpT = Math.min(flight.lerpT + delta / POLL_INTERVAL_S, 1);
    const t = flight.lerpT;


    const x = MathUtils.lerp(prev.position[0], current.position[0], t);
    const y = MathUtils.lerp(prev.position[1], current.position[1], t);
    const z = MathUtils.lerp(prev.position[2], current.position[2], t);

    groupRef.current.position.set(x, y, z); //set aircraft position
    //lerp heading
    let dh = current.heading - prev.heading;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    const heading = prev.heading + dh * t;
    groupRef.current.rotation.y = -(heading * Math.PI) / 180;


    //altitude line
    if (altitudeGeoRef.current) {
      const attr = altitudeGeoRef.current.attributes.position;
      attr.setXYZ(0, x, 0, z);
      attr.setXYZ(1, x, y, z);
      attr.needsUpdate = true;
    }

    if (trailGeoRef.current) {
      const attr = trailGeoRef.current.attributes.position;

      //live interpolated head
      attr.setXYZ(0, x, y, z);
  
      for(let i=1; i<flight.history.length; ++i) {
        const {position} = flight.history[i];
        attr.setXYZ(i, position[0], position[1], position[2]);
      }
      attr.needsUpdate = true;
    }
  });

  const onGround = flight.history[0]?.onGround ?? true;
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

      {!onGround && (
        <line>
          <bufferGeometry ref={trailGeoRef}>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array((flight.history.length) * 3), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ccff" transparent opacity={1} />
        </line>
      )}

      {!onGround && <AltitudeLine geoRef={altitudeGeoRef} />}
    </>
  );
}