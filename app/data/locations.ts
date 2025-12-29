// Import hero images with optimization
import japanHero from '../assets/images/japan/tokyo-skyline.png?format=webp&w=800&quality=80';
import italyHero from '../assets/images/italy/DSC01844.jpg?format=webp&w=800&quality=80';
import franceHero from '../assets/images/france/eiffel-from-streets.jpg?format=webp&w=800&quality=80';
import ukHero from '../assets/images/uk/DSC04177.jpg?format=webp&w=800&quality=80';
import norwayHero from '../assets/images/norway/DSC03664.jpg?format=webp&w=800&quality=80';
import switzerlandHero from '../assets/images/switzerland/DSC06301.jpg?format=webp&w=800&quality=80';

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
    name: 'Norway', 
    folder: 'norway',
    heroImage: norwayHero
  },
  { 
    name: 'Switzerland', 
    folder: 'switzerland',
    heroImage: switzerlandHero
  },
];

export function getLocationByFolder(folder: string): Location | undefined {
  return locations.find(loc => loc.folder.toLowerCase() === folder.toLowerCase());
}
