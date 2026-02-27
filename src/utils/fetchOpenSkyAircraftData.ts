import { AIRPORT, toXYZ } from "./coords";

const BOSTON_BBOX = `lamin=${(AIRPORT.lat-0.3).toFixed(4)}&lomin=${(AIRPORT.lon-0.3).toFixed(4)}&lamax=${(AIRPORT.lat+0.3).toFixed(4)}&lomax=${(AIRPORT.lon+0.3).toFixed(4)}`;

export async function fetchOpenSkyAircraftData() {
  try {
    const res = await fetch(
      `https://opensky-network.org/api/states/all?${BOSTON_BBOX}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: OpenSkyResponseType = await res.json();
    return parseFlights(data);
  } catch (err) {
    console.error('Failed to fetch flights:', err);
    return [];
  }
}

function parseFlights(data: OpenSkyResponseType): Flight[] {
  if (!data.states) return [];

  return data.states
    .filter((s): s is OpenSkyAircraftStateType => s[5] !== null && s[6] !== null)
    .map((s) => {
      const lon = s[5]!;
      const lat = s[6]!;
      const altitude = s[7] ?? s[13] ?? 0;

      return {
        icao: s[0],
        callsign: s[1]?.trim() ?? 'UNKNOWN',
        lon,
        lat,
        altitude,
        heading: s[10] ?? 0,
        velocity: s[9] ?? 0,
        onGround: s[8],
        position: toXYZ(lat, lon, altitude),
      };
    });
}

type OpenSkyResponseType = {
  "time": number, // 1772117048,
  "states": OpenSkyAircraftStateType[]
}

//https://openskynetwork.github.io/opensky-api/rest.html
type OpenSkyAircraftStateType = [
  string, //"a2f584",
  string | null, //"ASA537  ",
  string, //"United States",
  number, //1772116992,
  number, // 1772116992,
  number | null, // -70.9948,
  number | null, // 42.3551,
  number | null, // null,
  boolean, // true,
  number | null, // 0,
  number | null, // 135,
  number | null, // null,
  number[] | null, // null,
  number | null, // null,
  string | null, // null,
  boolean, // false,
  number, // 0
  number, // 0
]

export interface Flight {
  icao: string;
  callsign: string;
  lon: number;
  lat: number;
  altitude: number;
  heading: number;
  velocity: number;
  onGround: boolean;
  position: [number, number, number];
}