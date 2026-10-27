import type { TransitRouteDef } from '../types';
import { LOCATIONS } from './locations';

const PLAYER_LOCATION_IDS = LOCATIONS.filter(
  (location) => location.reachable !== false,
).map((location) => location.id);
const nameOf = (id: string) =>
  LOCATIONS.find((location) => location.id === id)?.name ?? id;

const BUS_FARE = 100;
const BUS_MINUTES = 5;
const TAXI_FARE = 400;
const TAXI_MINUTES = 3;

const BUS_ROUTES: TransitRouteDef[] = PLAYER_LOCATION_IDS.filter(
  (id) => id !== 'station',
).map((to) => ({
  id: `bus_station_${to}`,
  from: 'station',
  to,
  fare: BUS_FARE,
  minutes: BUS_MINUTES,
  label: nameOf(to),
  kind: 'bus',
}));

const TAXI_ROUTES: TransitRouteDef[] = PLAYER_LOCATION_IDS.flatMap((from) =>
  PLAYER_LOCATION_IDS.filter((to) => to !== from).map((to) => ({
    id: `taxi_${from}_${to}`,
    from,
    to,
    fare: TAXI_FARE,
    minutes: TAXI_MINUTES,
    label: nameOf(to),
    kind: 'taxi' as const,
  })),
);

export const TRANSIT_ROUTES: TransitRouteDef[] = [
  ...BUS_ROUTES,
  ...TAXI_ROUTES,
];
