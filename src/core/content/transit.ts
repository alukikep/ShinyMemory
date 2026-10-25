import type { TransitRouteDef } from '../types';

export const TRANSIT_ROUTES: TransitRouteDef[] = [
  {
    id: 'bus_station_office',
    from: 'station',
    to: 'office',
    fare: 200,
    minutes: 8,
    label: '事务所',
    kind: 'bus',
  },
  {
    id: 'bus_station_practice',
    from: 'station',
    to: 'practice_room',
    fare: 200,
    minutes: 10,
    label: '练习室',
    kind: 'bus',
  },
  {
    id: 'bus_station_studio',
    from: 'station',
    to: 'studio',
    fare: 300,
    minutes: 12,
    label: '录音棚',
    kind: 'bus',
  },
  {
    id: 'bus_station_home',
    from: 'station',
    to: 'home',
    fare: 200,
    minutes: 10,
    label: '家',
    kind: 'bus',
  },
];
