export interface Location {
  id: string;
  name: string;
  slug: string;
  description: string;
  folder: string;
  heroImage?: string; // Will be set dynamically
  photoCount?: number; // Will be set dynamically
}

export const locations: Location[] = [
  {
    id: 'japan',
    name: 'Japan',
    slug: 'japan',
    description: 'Ancient temples, modern cities, and serene landscapes',
    folder: 'japan',
  },
  {
    id: 'italy',
    name: 'Italy',
    slug: 'italy',
    description: 'Renaissance art, historic architecture, and Italian culture',
    folder: 'italy',
  },
  {
    id: 'france',
    name: 'France',
    slug: 'france',
    description: 'Parisian elegance, countryside charm, and cultural richness',
    folder: 'france',
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    slug: 'uk',
    description: 'Historic landmarks, royal heritage, and British culture',
    folder: 'uk',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    slug: 'dubai',
    description: 'Modern marvels, desert beauty, and architectural wonders',
    folder: 'dubai',
  },
  {
    id: 'norway',
    name: 'Norway',
    slug: 'norway',
    description: 'Fjords, northern lights, and Scandinavian beauty',
    folder: 'norway',
  },
];

export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find(loc => loc.slug.toLowerCase() === slug.toLowerCase());
}
