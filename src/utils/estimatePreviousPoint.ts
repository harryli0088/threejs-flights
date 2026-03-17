import type { Airport } from '../data/airports';
import { toXYZ } from './coords';
import type { FlightHistory } from './fetchOpenSkyAircraftData';

export function estimatePreviousPoint(f: FlightHistory, airport: Airport, deltaS = 7): FlightHistory {
  const { lat, lon, altitude, heading, velocity, onGround } = f;

  // Distance = velocity * time (deltaS seconds)
  const distance = velocity * deltaS; // meters

  // Convert heading to radians (0° = north)
  const headingRad = heading * Math.PI / 180;

  // Approximate delta lat/lon using simple equirectangular approximation
  const R = 6371000; // earth radius in meters
  const dLat = (distance * Math.cos(headingRad)) / R;
  const dLon = (distance * Math.sin(headingRad)) / (R * Math.cos(lat * Math.PI / 180));

  const prevLat = lat - (dLat * 180 / Math.PI);
  const prevLon = lon - (dLon * 180 / Math.PI);

  return {
    altitude,
    heading,
    lat: prevLat,
    lon: prevLon,
    onGround,
    velocity,
    position: toXYZ({ altitude, airport, lat: prevLat, lon: prevLon }),
  };
}