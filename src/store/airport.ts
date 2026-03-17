import { create } from "zustand";
import type { Airport } from "../data/airports";
import { useFlightStore } from "./flights";

interface AirpotState {
  airport: Airport;
  setAirport: (airport: Airport) => void;
}

export const useAirportStore = create<AirpotState>((set) => ({
  airport: {"iata":"BOS","name":"Boston Logan International Airport","municipality":"Boston","country":"US","lat":42.36197,"lon":-71.0079},
  setAirport: (airport) => set(() => {
    useFlightStore.setState({flights: new Map()}); //reset the flights
    return { airport };
  }),
}));