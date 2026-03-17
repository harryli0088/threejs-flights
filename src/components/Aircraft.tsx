import { useGLTF } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { Box3, BufferGeometry, Group, MathUtils, Vector3, type Object3DEventMap } from 'three';
import { useFrame } from '@react-three/fiber';
import { AltitudeLine } from './AltitudeLine';
import type { Flight } from '../utils/fetchOpenSkyAircraftData';
import { POLL_INTERVAL_S } from '../hooks/useFetchData';
import { POSITIONS_TO_SAVE, useFlightStore } from '../store/flights';

//preload model
const MODEL_PATH = `${import.meta.env.BASE_URL}737/737.glb`;
useGLTF.preload(MODEL_PATH);

//constants
const TARGET_LENGTH = 60;
const DEG2RAD = Math.PI / 180;

// cache normalization
let normalizedScaleCache: number | null = null;
function getNormalizedScale(scene: Group<Object3DEventMap>) {
  //if we've already computed the normalization, reuse the cached value
  if (normalizedScaleCache !== null) return normalizedScaleCache;

  //calculate the bounding box and largest dimension
  const box = new Box3().setFromObject(scene);
  const size = new Vector3();
  box.getSize(size);
  const longest = Math.max(size.x, size.y, size.z);

  //cache the normalization
  normalizedScaleCache = TARGET_LENGTH / longest;

  return normalizedScaleCache;
}

interface AircraftProps {
  flight: Flight;
  scale: number;
  onClick?: (flight: Flight) => void;
}

export function Aircraft({ flight, scale, onClick }: AircraftProps) {
  const { setHoveredFlightICAO } = useFlightStore();

  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_PATH);

  const trailGeoRef = useRef<BufferGeometry>(null);
  const altitudeGeoRef = useRef<BufferGeometry>(null);

  const { cloned, normalizedScale } = useMemo(() => {
    return {
      cloned: scene.clone(),
      normalizedScale: getNormalizedScale(scene)
    };
  }, [scene]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const history = flight.history;
    const current = history[0];
    const prev = history[1] ?? current;
    if (!current || !prev) return;

    flight.lerpT = Math.min(flight.lerpT + delta / POLL_INTERVAL_S, 1);
    const t = flight.lerpT;

    //lerp position
    const x = MathUtils.lerp(prev.position[0], current.position[0], t);
    const y = MathUtils.lerp(prev.position[1], current.position[1], t);
    const z = MathUtils.lerp(prev.position[2], current.position[2], t);
    group.position.set(x, y, z);

    //lerp heading
    let dh = current.heading - prev.heading;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    const heading = prev.heading + dh * t;
    group.rotation.y = -heading * DEG2RAD;

    // altitude line
    const altitudeGeo = altitudeGeoRef.current;
    if (altitudeGeo) {
      const attr = altitudeGeo.attributes.position;
      attr.setXYZ(0, x, 0, z);
      attr.setXYZ(1, x, y, z);
      attr.needsUpdate = true;
    }

    // trail
    const trailGeo = trailGeoRef.current;
    if (trailGeo) {
      const attr = trailGeo.attributes.position;

      attr.setXYZ(0, x, y, z);

      for (let i = 1; i < history.length; i++) {
        const p = history[i].position;
        attr.setXYZ(i, p[0], p[1], p[2]);
      }

      trailGeo.setDrawRange(0, history.length);
      attr.needsUpdate = true;
    }
  })

  const onGround = flight.history[0]?.onGround ?? true;

  return (
    <>
      <group
        ref={groupRef}
        scale={normalizedScale * scale}
        onClick={() => onClick?.(flight)}
        onPointerOver={() => setHoveredFlightICAO(flight.icao)}
        onPointerOut={() => setHoveredFlightICAO(null)}
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
              args={[new Float32Array(POSITIONS_TO_SAVE * 3), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ccff" transparent opacity={1} />
        </line>
      )}

      {!onGround && <AltitudeLine geoRef={altitudeGeoRef} />}
    </>
  );
}