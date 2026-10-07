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

  const captureDate = dateTaken ? new Date(dateTaken) : undefined;

  return {
    src: largest.src,
    width,
    height,
    alt,
    title,
    locationFolder: countryFolder,
    dateTaken:
      captureDate && Number.isFinite(captureDate.getTime())
        ? captureDate
        : undefined,
    srcSet: responsiveVariants.filter(
      (variant, index, variants) =>
        variants.findIndex((candidate) => candidate.width === variant.width) ===
        index
    ),
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
