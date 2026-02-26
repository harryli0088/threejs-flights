import { OrbitControls } from '@react-three/drei';
import { Aircraft } from './Aircraft';
import type { Flight } from '../utils/fetchOpenSkyAircraftData';
import { Terrain } from './Terrain';
import { useCameraDistance } from '../hooks/useCameraDistance';
import { getAircraftScale } from '../utils/aircraftScale';

interface SceneProps {
  flights: Flight[];
}

export function Scene({ flights }: SceneProps) {
  const cameraDistance = useCameraDistance();
  const aircraftScale = getAircraftScale(cameraDistance);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[1000, 2000, 1000]} intensity={1} />
      <Terrain />
      {flights.map((f) => (
        <Aircraft key={f.icao} flight={f} scale={aircraftScale} />
      ))}
      <OrbitControls />
    </>
  );
}