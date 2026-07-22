export interface Location {
  name: string;
  folder: string;
  heroImage: string;
}

// Note: keep sorted
export const locations: Location[] = [
  {
    name: 'France',
    folder: 'france',
    heroImage: '/images/france/eiffel-from-streets-800w.webp',
  },
  {
    name: 'Hong Kong',
    folder: 'hong-kong',
    heroImage: '/images/hong-kong/DSC05565-800w.webp',
  },
  {
    name: 'Italy',
    folder: 'italy',
    heroImage: '/images/italy/DSC01844-800w.webp',
  },
  {
    name: 'Japan',
    folder: 'japan',
    heroImage: '/images/japan/tokyo-skyline-800w.webp',
  },
  {
    name: 'Norway',
    folder: 'norway',
    heroImage: '/images/norway/DSC03664-800w.webp',
  },
  {
    name: 'Switzerland',
    folder: 'switzerland',
    heroImage: '/images/switzerland/DSC06301-800w.webp',
  },
  {
    name: 'United Kingdom',
    folder: 'uk',
    heroImage: '/images/uk/DSC04177-800w.webp',
  },
  {
    name: 'United States',
    folder: 'united-states',
    heroImage: '/images/united-states/DSC08453-800w.webp',
  },
];

export function getLocationByFolder(folder: string): Location | undefined {
  return locations.find((location) => location.folder === folder.toLowerCase());
}
