import { Html } from '@react-three/drei';

interface FlightLabelProps {
  position: [number, number, number];
  callsign: string;
  altitude: number;
}

export function FlightLabel({ position, callsign, altitude }: FlightLabelProps) {
  const altFt = Math.round(altitude * 3.28084);

  return (
    <Html
      position={position}
      center
      occlude={false}
      style={{ pointerEvents: 'none' }}
    >
      <div style={{
        background: 'rgba(0,0,0,0.7)',
        border: '1px solid rgba(0,200,255,0.5)',
        borderRadius: 4,
        padding: '4px 8px',
        color: '#00ccff',
        fontFamily: 'monospace',
        fontSize: 12,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}>
        {callsign}<br />
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>{altFt.toLocaleString()} ft</span>
      </div>
    </Html>
  );
}