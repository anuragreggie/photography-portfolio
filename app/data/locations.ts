// Import hero images with optimization
import japanHero from '../assets/images/japan/fuji-pagoda.jpg?format=webp&w=800&quality=80';
import italyHero from '../assets/images/italy/DSC01737-2.jpg?format=webp&w=800&quality=80';
import franceHero from '../assets/images/france/bear-in-car.jpg?format=webp&w=800&quality=80';
import ukHero from '../assets/images/uk/curvy-street.jpg?format=webp&w=800&quality=80';
import dubaiHero from '../assets/images/dubai/Dubai-sunset.jpg?format=webp&w=800&quality=80';
import norwayHero from '../assets/images/norway/DSC03635.jpg?format=webp&w=800&quality=80';

export interface Location {
  name: string;
  folder: string;
  heroImage: string;
}

export const locations: Location[] = [
  { 
    name: 'Japan', 
    folder: 'japan',
    heroImage: japanHero
  },
  { 
    name: 'Italy', 
    folder: 'italy',
    heroImage: italyHero
  },
  { 
    name: 'France', 
    folder: 'france',
    heroImage: franceHero
  },
  { 
    name: 'United Kingdom', 
    folder: 'uk',
    heroImage: ukHero
  },
  { 
    name: 'Dubai', 
    folder: 'dubai',
    heroImage: dubaiHero
  },
  { 
    name: 'Norway', 
    folder: 'norway',
    heroImage: norwayHero
  },
];

export function getLocationByFolder(folder: string): Location | undefined {
  return locations.find(loc => loc.folder.toLowerCase() === folder.toLowerCase());
}
