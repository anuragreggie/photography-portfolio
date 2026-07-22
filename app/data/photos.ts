import type { Photo } from 'react-photo-album';
import imageManifest from './image-manifest.json';

export type PortfolioPhoto = Photo & {
  dateTaken?: Date;
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

function sortPhotosByDate(photos: PortfolioPhoto[]): PortfolioPhoto[] {
  return photos.sort((a, b) => {
    const aTime = a.dateTaken?.getTime();
    const bTime = b.dateTaken?.getTime();

    if (aTime && bTime) return bTime - aTime;
    if (aTime && !bTime) return -1;
    if (!aTime && bTime) return 1;

    return a.src.localeCompare(b.src);
  });
}

function createPhoto(entry: ImageManifestEntry): PortfolioPhoto {
  const { width, height, title, alt, dateTaken, responsiveVariants } = entry;
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
    dateTaken: dateTaken ? new Date(dateTaken) : undefined,
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

export function createPhotosByLocation(location: string): PortfolioPhoto[] {
  const normalizedLocation = location.toLowerCase();

  return sortPhotosByDate(
    Object.values(manifest.images)
      .filter(
        (entry) => entry.countryFolder.toLowerCase() === normalizedLocation
      )
      .map(createPhoto)
  );
}
