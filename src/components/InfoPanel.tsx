import type { TrackedFlight } from "../hooks/useFlights";

interface InfoPanelProps {
  flight: TrackedFlight;
  onClose: () => void;
}

export function InfoPanel({ flight, onClose }: InfoPanelProps) {
  const altFt = Math.round(flight.altitude * 3.28084);
  const speedKts = Math.round((flight.velocity ?? 0) * 1.944);

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      right: 20,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 12,
      padding: '16px 20px',
      color: 'white',
      fontFamily: 'monospace',
      minWidth: 220,
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 'bold', letterSpacing: 2 }}>
          {flight.callsign}
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 18 }}
        >×</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 13 }}>
        <Stat label="ICAO" value={flight.icao.toUpperCase()} />
        <Stat label="STATUS" value={flight.onGround ? 'ON GROUND' : 'AIRBORNE'} />
        <Stat label="ALTITUDE" value={`${altFt.toLocaleString()} ft`} />
        <Stat label="SPEED" value={`${speedKts} kts`} />
        <Stat label="HEADING" value={`${Math.round(flight.heading)}°`} />
        {/* <Stat label="SQUAWK" value={flight.squawk ?? '----'} /> */}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 2 }}>{label}</div>
      <div>{value}</div>
    </div>
  );
}