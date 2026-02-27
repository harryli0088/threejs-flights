import type { Airport } from "../data/airports";
import { toXYZ } from "./coords";

function getBBOX({lat,lon}:{lat:number,lon:number}) {
  return `lamin=${(lat-0.3).toFixed(4)}&lomin=${(lon-0.3).toFixed(4)}&lamax=${(lat+0.3).toFixed(4)}&lomax=${(lon+0.3).toFixed(4)}`
}

export async function fetchOpenSkyAircraftData(airport: Airport) {
  try {
    const res = await fetch(
      `https://opensky-network.org/api/states/all?${getBBOX(airport)}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: OpenSkyResponseType = await res.json();
    return parseFlights(data, airport);
  } catch (err) {
    console.error('Failed to fetch flights:', err);
    return [];
  }
}


function parseFlights(data: OpenSkyResponseType, airport: Airport): Flight[] {
  if (!data.states) return [];

  return data.states
    .filter((s): s is OpenSkyAircraftStateType => s[5] !== null && s[6] !== null)
    .map((s) => {
      const lon = s[5]!;
      const lat = s[6]!;
      const altitude = s[7] ?? s[13] ?? 0;

      return {
        callsign: s[1]?.trim() ?? 'UNKNOWN',
        icao: s[0],
        history: [{
          altitude,
          heading: s[10] ?? 0,
          lat,
          lon,
          onGround: s[8],
          position: toXYZ({altitude, airport, lat, lon}),
          velocity: s[9] ?? 0,
        }],
        lerpT: 0,
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
  callsign: string;
  icao: string;
  history: FlightHistory[];
  lerpT: number; //between 0 and 1, used for interpolation
}

export interface FlightHistory {
  altitude: number;
  heading: number;
  lat: number;
  lon: number;
  onGround: boolean;
  position: [number, number, number];
  velocity: number;
}