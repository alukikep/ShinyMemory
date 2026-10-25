const ICON_PATHS: Record<string, string[]> = {
  star: ['m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z'],
  sparkle: ['m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z'],
  music: [
    'M9 18V5l11-2v13M9 8l11-2',
    'M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6m11-2a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  ],
  mic: [
    'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V5Z',
    'M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8',
  ],
  home: ['m3 10 9-7 9 7', 'M5 9v11h14V9', 'M9 20v-7h6v7'],
  building: [
    'M4 21V5l8-3 8 3v16',
    'M8 8h2m4 0h2M8 12h2m4 0h2M8 16h2m4 0h2',
    'M10 21v-4h4v4',
  ],
  train: [
    'M6 4h12a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Z',
    'M4 10h16M8 18l-2 3m10-3 2 3',
    'M9 15h.01M15 15h.01',
  ],
  bus: [
    'M5 17h14V6a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v11Z',
    'M5 10h14',
    'M8 21v-4m8 4v-4',
    'M8 14h.01M16 14h.01',
  ],
  taxi: [
    'M4 17h16l-1.5-5.5L16 8H8l-2.5 3.5L4 17Z',
    'M7 17v2m10-2v2',
    'M8 12h8M9 6h6',
  ],
  compass: [
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
    'm16 8-3 5-5 3 3-5 5-3Z',
  ],
  book: [
    'M12 6C8 3 4 4 3 5v14c3-2 6-1 9 1 3-2 6-3 9-1V5c-1-1-5-2-9 1Z',
    'M12 6v14',
  ],
  coffee: [
    'M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z',
    'M16 9h2a3 3 0 0 1 0 6h-2',
    'M7 2v3',
    'M12 2v3',
    'M2 22h18',
  ],
  sun: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
    'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
  ],
  moon: ['M20.5 13A9 9 0 0 1 11 3a9 9 0 1 0 9.5 10Z'],
  heart: ['M12 21 3.5 12.5A6 6 0 0 1 12 4a6 6 0 0 1 8.5 8.5L12 21Z'],
  bolt: ['m13 2-9 12h7l-1 8 10-13h-7l1-7Z'],
  coin: [
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
    'M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9',
    'M12 6v2m0 8v2',
  ],
  flag: ['M5 22V3c5-3 9 3 14 0v10c-5 3-9-3-14 0'],
  clock: [
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
    'M12 7v5l3 2',
  ],
  calendar: [
    'M4 5h16v16H4V5Z',
    'M8 3v4m8-4v4M4 10h16',
  ],
  map: [
    'm3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z',
    'M9 3v16m6-14v16',
  ],
  people: [
    'M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
    'M2 21v-3a7 7 0 0 1 14 0v3',
    'M17 4a4 4 0 0 1 0 8m2 3a6 6 0 0 1 3 6',
  ],
  walk: [
    'M13 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
    'm9 22 2-7 2-3 2 3 3 2',
    'm11 12-4-2 2-4',
    'm13 12 4-2',
  ],
  arrow: ['M4 12h16m-6-6 6 6-6 6'],
  chevron: ['m9 5 7 7-7 7'],
  close: ['m6 6 12 12M6 18 18 6'],
  check: ['m5 12 4 4L19 6'],
};

export function getIconPaths(name: string): string[] {
  return ICON_PATHS[name] ?? ICON_PATHS.compass;
}

export function GameIcon({
  name,
  size = 18,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {getIconPaths(name).map((path, index) => (
        <path key={index} d={path} />
      ))}
    </svg>
  );
}
