import { Html } from '@react-three/drei';
import type { Flight } from '../utils/fetchOpenSkyAircraftData';

import styles from "./FlightLabel.module.scss"

export function FlightLabel({flight}:{flight:Flight}) {
  const current = flight.history[0];
  const altFt = Math.round(current.altitude * 3.28084);

  return (
    <Html
      position={current.position}
      center
      occlude={false}
      style={{ pointerEvents: 'none' }}
    >
      <div className={styles["flight-label"]}>
        {flight.callsign}<br />
        <span>{altFt.toLocaleString()} ft</span>
      </div>
    </Html>
  );
}