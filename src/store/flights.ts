import { create } from "zustand";
import type { Flight } from "../utils/fetchOpenSkyAircraftData";
import { useShallow } from "zustand/shallow";
import { estimatePreviousPoint } from "../utils/estimatePreviousPoint";
import { useAirportStore } from "./airport";

interface FlightState {
  flights: Map<string, Flight>;
  mergeFlights: (incoming: Flight[]) => void;

  hoveredFlightICAO: string | null;
  setHoveredFlightICAO: (icao:string | null) => void;


  selectedFlightICAO: string | null;
  setSelectedFlightICAO: (icao:string | null) => void;
}

export const POSITIONS_TO_SAVE = 10;
export const useFlightStore = create<FlightState>((set) => ({
  flights: new Map(),
  mergeFlights: (incoming) => set((state) => {
    const map = new Map(state.flights);
    incoming.forEach((f) => {
      const existing = map.get(f.icao);
      if (!existing) {
          // First time we see this aircraft — estimate a previous point
          const current = f.history[0];
          const airport = useAirportStore.getState().airport;
          const prev = estimatePreviousPoint(current, airport);

          map.set(f.icao, {
            ...f,
            history: [current, prev], // previous point first
            lerpT: 0, // start interpolation from prev -> current
          });
        } else {
          // Subsequent poll — start interpolating from where it currently is
          // to the new position over the next 10 seconds
          map.set(f.icao, {
            ...f,
            history: f.history.concat(existing.history).slice(0,POSITIONS_TO_SAVE),
            lerpT: 0, // reset lerp
          });
        }
    });
    // remove stale aircraft
    map.forEach((_, key) => {
      if (!incoming.find(f => f.icao === key)) map.delete(key);
    });
    return { flights: map };
  }),

  hoveredFlightICAO: null,
  setHoveredFlightICAO: (icao) => set({ hoveredFlightICAO: icao }),

  selectedFlightICAO: null,
  setSelectedFlightICAO: (icao) => set({ selectedFlightICAO: icao }),
}));

export const useFlights = () => useFlightStore(
  useShallow(state => Array.from(state.flights.values()))
);