import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { fetchOpenSkyAircraftData, type Flight } from '../utils/fetchOpenSkyAircraftData';

const POLL_INTERVAL_MS = 10_000;

export interface TrackedFlight extends Flight {
  prevPosition: [number, number, number];
  targetPosition: [number, number, number];
  prevHeading: number;
  targetHeading: number;
  lerpT: number;
}

export function useFlights(): TrackedFlight[] {
  const flightMapRef = useRef<Map<string, TrackedFlight>>(new Map());

  const { data } = useQuery({
    queryKey: ['flights'],
    queryFn: async () => {
      const map = flightMapRef.current;

      const data = await fetchOpenSkyAircraftData();
      data.forEach((f: Flight) => {
        const existing = map.get(f.icao);

        if (!existing) {
          // First time we see this aircraft — render in place, no interpolation yet
          map.set(f.icao, {
            ...f,
            prevPosition: f.position,
            targetPosition: f.position, // same as prev, stays still
            prevHeading: f.heading,
            targetHeading: f.heading,
            lerpT: 1, // already "arrived"
          });
        } else {
          // Subsequent poll — start interpolating from where it currently is
          // to the new position over the next 10 seconds
          map.set(f.icao, {
            ...f,
            prevPosition: existing.targetPosition, // start from last known target
            targetPosition: f.position,            // move to new position
            prevHeading: existing.targetHeading,
            targetHeading: f.heading,
            lerpT: 0,                              // reset lerp
          });
        }
      });

      // Remove stale aircraft
      map.forEach((_, key) => {
        if (!data.find((f: Flight) => f.icao === key)) map.delete(key);
      });

      return Array.from(map.values());
    },
    initialData: [] as TrackedFlight[],
    refetchInterval: POLL_INTERVAL_MS,
  });

  return data;
}