import { OrbitControls } from '@react-three/drei';
import { Aircraft } from './Aircraft';
import { Terrain } from './Terrain';
import { useCameraDistance } from '../hooks/useCameraDistance';
import { getAircraftScale } from '../utils/aircraftScale';
import { usePanTo } from '../utils/usePanTo';
import { FlightLabel } from './FlightLabel';
import { useState } from 'react';
import type { TrackedFlight } from '../hooks/useFlights';

interface SceneProps {
  flights: TrackedFlight[];
  onSelect: (icao: string) => void;
}

export function Scene({ flights, onSelect }: SceneProps) {
  const { controlsRef, panTo } = usePanTo();
  const cameraDistance = useCameraDistance();
  const aircraftScale = getAircraftScale(cameraDistance);
  const [hoveredFlight, setHoveredFlight] = useState<TrackedFlight | null>(null);

  function handleClick(flight: TrackedFlight) {
    onSelect(flight.icao);
    panTo(flight.targetPosition[0], flight.targetPosition[1], flight.targetPosition[2]);
  }

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[1000, 2000, 1000]} intensity={1} />
      <Terrain />
      {flights.map(f => (
        <group key={f.icao}>
          <Aircraft
            flight={f}
            scale={aircraftScale}
            onClick={handleClick}
            onPointerOver={() => setHoveredFlight(f)}
            onPointerOut={() => setHoveredFlight(null)}
          />
          {hoveredFlight?.icao === f.icao && (
            <FlightLabel
              position={f.targetPosition}
              callsign={f.callsign}
              altitude={f.altitude}
            />
          )}
        </group>
      ))}
      <OrbitControls ref={controlsRef} />
    </>
  );
}