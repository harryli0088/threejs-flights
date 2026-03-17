import { OrbitControls } from '@react-three/drei';
import { Aircraft } from './Aircraft';
import { Terrain } from './Terrain';
import { useCameraDistance } from '../hooks/useCameraDistance';
import { getAircraftScale } from '../utils/aircraftScale';
import { usePanTo } from '../utils/usePanTo';
import { FlightLabel } from './FlightLabel';
import type { Flight } from '../utils/fetchOpenSkyAircraftData';
import { useFlights, useFlightStore } from '../store/flights';

export function Scene() {
  const flights = useFlights();
  const { hoveredFlightICAO, setSelectedFlightICAO } = useFlightStore();

  const { controlsRef, panTo } = usePanTo();
  const cameraDistance = useCameraDistance();
  const aircraftScale = getAircraftScale(cameraDistance);

  function handleClick(flight: Flight) {
    setSelectedFlightICAO(flight.icao);
    const position = flight.history[0].position;
    panTo(position[0], position[1], position[2]);
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
          />
          {hoveredFlightICAO === f.icao && (
            <FlightLabel flight={f}/>
          )}
        </group>
      ))}
      <OrbitControls ref={controlsRef} />
    </>
  );
}