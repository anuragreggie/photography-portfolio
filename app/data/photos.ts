import type { Photo } from 'react-photo-album';
import imageManifest from './image-manifest.json';

export type PortfolioPhoto = Photo & {
  dateTaken?: Date;
  locationFolder: string;
};

type ImageManifestEntry = {
  relPath: string;
  countryFolder: string;
  title: string;
  alt: string;
  width: number;
  height: number;
  dateTaken: string | null;
  responsiveVariants: Array<{ width: number; height: number; src: string }>;
};

type ImageManifest = {
  images: Record<string, ImageManifestEntry>;
};

const manifest = imageManifest as ImageManifest;
const FALLBACK_DATE_TAKEN = new Date('2025-06-01T00:00:00.000Z');

function createPhoto(entry: ImageManifestEntry): PortfolioPhoto {
  const {
    width,
    height,
    title,
    alt,
    dateTaken,
    responsiveVariants,
    countryFolder,
  } = entry;
  const largest = responsiveVariants.at(-1);

  if (!largest) {
    throw new Error(`No responsive variants found for ${entry.relPath}`);
  }

  return {
    src: largest.src,
    width,
    height,
    alt,
    title,
    locationFolder: countryFolder,
    dateTaken: dateTaken ? new Date(dateTaken) : FALLBACK_DATE_TAKEN,
    srcSet: responsiveVariants,
  };
}

export function createPhotosByPaths(paths: string[]): PortfolioPhoto[] {
  if (paths.length === 0) return [];

  return paths
    .map((path) => manifest.images[path.toLowerCase()])
    .filter((entry): entry is ImageManifestEntry => entry !== undefined)
    .map(createPhoto);
}

export function createAllPhotos(): PortfolioPhoto[] {
  return Object.values(manifest.images).map(createPhoto);
}
