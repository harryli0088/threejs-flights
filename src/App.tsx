import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import { Scene } from './components/Scene';
import { InfoPanel } from './components/InfoPanel';
import { useFlights } from './hooks/useFlights';
import type { TrackedFlight } from './hooks/useFlights';

export default function App() {
  const flights = useFlights();
  const [selectedFlightICAO, setSelectedFlightICAO] = useState<string | null>(null);
  const selectedFlight = flights.find(f => f.icao === selectedFlightICAO);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a1a' }}>
      <Canvas camera={{ position: [0, 50000, 50000], fov: 60, near: 1, far: 500_000 }}>
        <Scene flights={flights} onSelect={setSelectedFlightICAO} />
      </Canvas>
      <div style={{ position: 'absolute', top: 16, left: 16, color: 'white', fontFamily: 'monospace' }}>
        {flights.length} aircraft tracked
      </div>
      {selectedFlight && <InfoPanel flight={selectedFlight} onClose={() => setSelectedFlightICAO(null)} />}
    </div>
  );
}