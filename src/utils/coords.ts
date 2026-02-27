export const AIRPORT = { lat: 35.7702, lon: 140.3843 } as const;
// export const AIRPORT = { lat: 51.4680, lon: -0.4599 } as const;
// export const AIRPORT = { lat: 42.3656, lon: -71.0096 } as const;
const R = 6_371_000; // earth radius in meters

export function toXYZ(
  lat: number,
  lon: number,
  altitudeMeters: number
): [number, number, number] {
  const x =
    (lon - AIRPORT.lon) *
    (Math.PI / 180) *
    R *
    Math.cos((AIRPORT.lat * Math.PI) / 180);
  const z = -(lat - AIRPORT.lat) * (Math.PI / 180) * R;
  return [x, altitudeMeters, z];
}