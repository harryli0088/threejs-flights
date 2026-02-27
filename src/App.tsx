import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { InfoPanel } from './components/InfoPanel';
import { useFlights } from './store/flights';
import { useFetchData } from './hooks/useFetchData';

import styles from "./App.module.scss"
import { SearchAirport } from './components/SearchAirport';

export default function App() {
  useFetchData();

  const flights = useFlights();

  return (
    <main id={styles["app"]}>
      <Canvas camera={{ position: [0, 50000, 50000], fov: 60, near: 1, far: 500_000 }}>
        <Scene/>
      </Canvas>

      <div id={styles["control-bar"]}>
        <SearchAirport/>

        <p>{flights.length} aircraft tracked</p>
      </div>

      <InfoPanel/>
    </main>
  );
}