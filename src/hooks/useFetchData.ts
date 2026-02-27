import { useQuery } from "@tanstack/react-query";
import { fetchOpenSkyAircraftData } from "../utils/fetchOpenSkyAircraftData";
import { useFlightStore } from "../store/flights";
import { useAirportStore } from "../store/airport";

const POLL_INTERVAL_MS = 10_000;
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