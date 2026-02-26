import { Canvas } from '@react-three/fiber';
import './App.css'
import { useFlights } from './hooks/useFlights';
import { Scene } from './components/Scene';

function App() {
  const flights = useFlights();

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a1a' }}>
      <Canvas
        camera={{
          position: [0, 50000, 50000],
          fov: 60,
          near: 1,
          far: 500_000,
        }}
      >
        <Scene flights={flights.data} />
      </Canvas>
      <div style={{ position: 'absolute', top: 16, left: 16, color: 'white' }}>
        {flights.data.length} aircraft tracked
      </div>
    </div>
  );
}

export default App
