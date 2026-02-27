import { create } from "zustand";
import type { Flight } from "../utils/fetchOpenSkyAircraftData";
import { useShallow } from "zustand/shallow";

interface FlightState {
  flights: Map<string, Flight>;
  mergeFlights: (incoming: Flight[]) => void;
  selectedFlightICAO: string | null;
  setSelectedFlightICAO: (icao:string | null) => void;
}

const POSITIONS_TO_SAVE = 10;
export const useFlightStore = create<FlightState>((set) => ({
  flights: new Map(),
  mergeFlights: (incoming) => set((state) => {
    const map = new Map(state.flights);
    incoming.forEach((f) => {
      const existing = map.get(f.icao);
      if (!existing) {
          // First time we see this aircraft — render in place, no interpolation yet
          map.set(f.icao, {
            ...f,
            lerpT: 1, // already "arrived"
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

  selectedFlightICAO: null,
  setSelectedFlightICAO: (icao) => set({ selectedFlightICAO: icao }),
}));

export const useFlights = () => useFlightStore(
  useShallow(state => Array.from(state.flights.values()))
);