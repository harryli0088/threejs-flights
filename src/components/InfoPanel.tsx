import { useFlightStore } from "../store/flights";

import styles from "./InfoPanel.module.scss"

export function InfoPanel() {
  const { flights, selectedFlightICAO, setSelectedFlightICAO } = useFlightStore();
  if(!selectedFlightICAO) return null;
  const flight = flights.get(selectedFlightICAO);
  if(!flight) return null;

  const current = flight.history[0];
  const altFt = Math.round(current.altitude * 3.28084);
  const speedKts = Math.round((current.velocity ?? 0) * 1.944);

  return (
    <div id={styles["info-panel"]}>
      <div id={styles["heading"]}>
        <span id={styles["callsign"]}>
          {flight.callsign}
        </span>
        <button id={styles["close-button"]} onClick={() => setSelectedFlightICAO(null)}>×</button>
      </div>
      <div id={styles["content"]}>
        <Stat label="ICAO" value={flight.icao.toUpperCase()} />
        <Stat label="STATUS" value={current.onGround ? 'ON GROUND' : 'AIRBORNE'} />
        <Stat label="ALTITUDE" value={`${altFt.toLocaleString()} ft`} />
        <Stat label="SPEED" value={`${speedKts} kts`} />
        <Stat label="HEADING" value={`${Math.round(current.heading)}°`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className={styles["label"]}>{label}</div>
      <div>{value}</div>
    </div>
  );
}