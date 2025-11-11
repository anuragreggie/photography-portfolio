import type { Photo } from "react-photo-album";
import pkg from 'exifr';

const { parse } = pkg;

export type PhotoWithCountry = Photo & {
  country: string;
  dateTaken?: Date;
  relPath: string;
};

type PhotoMetadata = {
  importFn: () => Promise<string>;
  alt: string;
  title: string;
  country: string;
  relPath: string;
};

type LocationMetadata = Record<string, {
  heroImage: string | null;
}>;

const BREAKPOINTS = [400, 800, 1280, 1920] as const;

const IMAGE_MODULES = import.meta.glob(
  '../assets/images/*/*.{jpg,jpeg,png,webp}',
  {
    eager: false,
    import: 'default',
    query: {
      format: 'webp',
      quality: '80',
      w: '1920',
    },
  }
) as Record<string, () => Promise<string>>;

async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ 
      width: img.naturalWidth, 
      height: img.naturalHeight 
    });
    img.onerror = reject;
    img.src = src;
  });
}

function capitalizeCountry(folder: string): string {
  return folder.charAt(0).toUpperCase() + folder.slice(1).toLowerCase();
}

function formatImageTitle(filename: string, country: string): string {
  return filename
    .replace(/\.(jpg|jpeg|png|webp)$/i, '')
    .replace(/DSC0*/i, `${country} `);
}

function sortPhotosByDate(photos: PhotoWithCountry[]): PhotoWithCountry[] {
  return photos.sort((a, b) => {
    const aTime = a.dateTaken?.getTime();
    const bTime = b.dateTaken?.getTime();
    
    if (aTime && bTime) return bTime - aTime;
    if (aTime && !bTime) return -1;
    if (!aTime && bTime) return 1;
    
    return a.src.localeCompare(b.src);
  });
}

const PHOTO_METADATA: PhotoMetadata[] = Object.entries(IMAGE_MODULES).map(([path, importFn]) => {
  const pathParts = path.split('/');
  const countryFolder = pathParts[pathParts.length - 2];
  const filename = pathParts[pathParts.length - 1];

  const country = capitalizeCountry(countryFolder);
  const relPath = `${countryFolder}/${filename}`;
  const title = formatImageTitle(filename, country);

  return {
    importFn,
    alt: title,
    title,
    country,
    relPath,
  };
});

const METADATA_BY_PATH = new Map(
  PHOTO_METADATA.map(meta => [meta.relPath.toLowerCase(), meta])
);

async function loadSinglePhoto(metadata: PhotoMetadata): Promise<PhotoWithCountry | null> {
  const { importFn, alt, title, country, relPath } = metadata;
  
  try {
    const src = await importFn();
    
    if (!src) {
      console.warn(`[Photo Loader] No source for ${relPath}`);
      return null;
    }
    
    const [dimensions, exif] = await Promise.all([
      getImageDimensions(src),
      parse(src).catch(() => null),
    ]);
    
    const { width, height } = dimensions;
    
    if (!width || !height || width <= 0 || height <= 0) {
      console.warn(`[Photo Loader] Invalid dimensions for ${relPath}: ${width}x${height}`);
      return null;
    }
    
    const dateTaken = exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate;
    
    const srcSet = BREAKPOINTS.map((breakpoint) => ({
      src,
      width: breakpoint,
      height: Math.round((height / width) * breakpoint),
    }));
    
    return {
      src,
      width,
      height,
      alt,
      title,
      country,
      relPath,
      dateTaken: dateTaken ? new Date(dateTaken) : undefined,
      srcSet,
    };
  } catch (error) {
    console.error(`[Photo Loader] Failed to load ${relPath}:`, error);
    return null;
  }
}

async function loadMultiplePhotos(
  metadataList: PhotoMetadata[],
  sort: boolean = false
): Promise<PhotoWithCountry[]> {
  const results = await Promise.all(metadataList.map(loadSinglePhoto));
  const validPhotos = results.filter((photo): photo is PhotoWithCountry => photo !== null);
  return sort ? sortPhotosByDate(validPhotos) : validPhotos;
}

export async function createPhotosByPaths(paths: string[]): Promise<PhotoWithCountry[]> {
  if (paths.length === 0) return [];

  const pathOrder = new Map(paths.map((path, idx) => [path.toLowerCase(), idx]));
  
  const requestedMetadata = paths
    .map(path => METADATA_BY_PATH.get(path.toLowerCase()))
    .filter((meta): meta is PhotoMetadata => meta !== undefined);
  
  const photos = await loadMultiplePhotos(requestedMetadata, false);
  
  return photos.sort((a, b) => {
    const orderA = pathOrder.get(a.relPath.toLowerCase()) ?? 999;
    const orderB = pathOrder.get(b.relPath.toLowerCase()) ?? 999;
    return orderA - orderB;
  });
}

export async function createPhotosByLocation(location: string): Promise<PhotoWithCountry[]> {
  const normalizedLocation = location.toLowerCase();
  
  const locationMetadata = PHOTO_METADATA.filter(({ relPath }) =>
    relPath.toLowerCase().startsWith(`${normalizedLocation}/`)
  );
  
  return loadMultiplePhotos(locationMetadata, true);
}

export async function getLocationMetadata(): Promise<LocationMetadata> {
  const heroMetadataMap = new Map<string, PhotoMetadata>();
  const metadata: LocationMetadata = {};
  
  for (const meta of PHOTO_METADATA) {
    const countryKey = meta.country.toLowerCase();
    
    if (!heroMetadataMap.has(countryKey)) {
      heroMetadataMap.set(countryKey, meta);
      metadata[countryKey] = { heroImage: null };
    }
  }
  
  const heroPhotos = await loadMultiplePhotos(Array.from(heroMetadataMap.values()), false);
  
  for (const photo of heroPhotos) {
    const countryKey = photo.country.toLowerCase();
    metadata[countryKey] = { heroImage: photo.src };
  }
  
  return metadata;
}
