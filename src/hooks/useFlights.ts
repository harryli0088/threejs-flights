import { useQuery } from '@tanstack/react-query';
import { fetchOpenSkyAircraftData } from '../utils/fetchOpenSkyAircraftData';

const BOSTON_BBOX = 'lamin=42.0656&lomin=-71.3096&lamax=42.6656&lomax=-70.7096';
const POLL_INTERVAL_MS = 10_000;

export function useFlights() {
  return useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      return await fetchOpenSkyAircraftData();
    },
    initialData: [],
    refetchInterval: POLL_INTERVAL_MS,
  })
}