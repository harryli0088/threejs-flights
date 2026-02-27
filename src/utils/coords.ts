import type { Airport } from "../data/airports";

const R = 6_371_000; // earth radius in meters

export function toXYZ({
  altitude,
  airport,
  lat,
  lon,
}:{
  altitude: number, //meters
  airport: Airport,
  lat: number,
  lon: number,
}): [number, number, number] {
  const x =
    (lon - airport.lon) *
    (Math.PI / 180) *
    R *
    Math.cos((airport.lat * Math.PI) / 180);
  const z = -(lat - airport.lat) * (Math.PI / 180) * R;
  return [x, altitude, z];
}