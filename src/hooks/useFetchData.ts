import { useQuery } from "@tanstack/react-query";
import { fetchOpenSkyAircraftData } from "../utils/fetchOpenSkyAircraftData";
import { useFlightStore } from "../store/flights";
import { useAirportStore } from "../store/airport";

export const POLL_INTERVAL_S = 10;
const POLL_INTERVAL_MS = POLL_INTERVAL_S * 1000;
export function useFetchData() {
  const { airport } = useAirportStore();

  useQuery({
    queryKey: ['flights',airport],
    queryFn: async () => {
      const data = await fetchOpenSkyAircraftData(airport);
      useFlightStore.getState().mergeFlights(data);
      return null; // React Query doesn't need to own the data
    },
    refetchInterval: POLL_INTERVAL_MS,
  });
}