import type { Photo } from "react-photo-album";
import pkg from 'exifr';

const { parse } = pkg;

export type PhotoWithCountry = Photo & {
  country: string;
  dateTaken?: Date;
  relPath: string; // e.g., "italy/DSC01844.jpg"
};

const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

const allImageModules = import.meta.glob('../assets/images/*/*.{jpg,jpeg,png,webp}', {
  eager: false, 
  import: 'default' 
}) as Record<string, () => Promise<string>>;

function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
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
    if (!a || !b) return 0;
    
    const aTime = a.dateTaken?.getTime();
    const bTime = b.dateTaken?.getTime();
    
    if (aTime && bTime) return bTime - aTime; // newest first
    if (aTime && !bTime) return -1;
    if (!aTime && bTime) return 1;
    
    return (a.src || '').localeCompare(b.src || '');
  });
}

type PhotoMetadata = {
  importFn: () => Promise<string>;
  alt: string;
  title: string;
  country: string;
  relPath: string;
};

const photoMetadata: PhotoMetadata[] = Object.entries(allImageModules)
  .map(([path, importFn], idx) => {
    const pathParts = path.split('/');
    const countryFolder = pathParts[pathParts.length - 2];
    const filename = pathParts.pop() || `image-${idx}`;

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

async function loadPhotoData(metadata: PhotoMetadata): Promise<PhotoWithCountry | null> {
  const { importFn, alt, title, country, relPath } = metadata;
  
  try {
    const src = await importFn();
    const exif = await parse(src).catch(() => null);
    const dateTaken = exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate;
    const { width, height } = await getImageDimensions(src);
    
    if (!width || !height || width <= 0 || height <= 0) {
      console.warn(`Invalid dimensions for image ${relPath}: ${width}x${height}`);
      return null;
    }
    
    return {
      src,
      width,
      height,
      alt,
      title,
      country,
      relPath,
      dateTaken: dateTaken ? new Date(dateTaken) : undefined,
      srcSet: breakpoints.map((breakpoint) => ({
        src,
        width: breakpoint,
        height: Math.round((height / width) * breakpoint),
      })),
    };
  } catch (error) {
    console.error(`Failed to load image ${relPath}:`, error);
    return null;
  }
}

async function loadMultiplePhotos(
  metadataList: PhotoMetadata[],
  sortFn?: (photos: PhotoWithCountry[]) => PhotoWithCountry[]
): Promise<PhotoWithCountry[]> {
  const photoPromises = metadataList.map(loadPhotoData);
  const loadedPhotos = await Promise.all(photoPromises);
  const validPhotos = loadedPhotos.filter((p): p is PhotoWithCountry => p !== null);
  
  return sortFn ? sortFn(validPhotos) : validPhotos;
}

const photoCachePromise: Promise<PhotoWithCountry[]> = (async () => {
  return loadMultiplePhotos(photoMetadata, sortPhotosByDate);
})();

async function getCachedPhotos(): Promise<PhotoWithCountry[]> {
  return photoCachePromise;
}

const createPhotos = async (): Promise<PhotoWithCountry[]> => {
  return getCachedPhotos();
};

export const createPhotosByPaths = async (paths: string[]): Promise<PhotoWithCountry[]> => {
  if (paths.length === 0) return [];

  const order = new Map(paths.map((path, idx) => [path.toLowerCase(), idx]));
  const photos = await getCachedPhotos();
  const filtered = photos.filter(({ relPath }) => order.has(relPath.toLowerCase()));

  return filtered.sort((a, b) => 
    (order.get(a.relPath.toLowerCase()) ?? 0) - (order.get(b.relPath.toLowerCase()) ?? 0)
  );
};

export const createPhotosByLocation = async (locationFolder: string): Promise<PhotoWithCountry[]> => {
  const normalized = locationFolder.toLowerCase();
  const photos = await getCachedPhotos();
  const filtered = photos.filter(({ relPath }) => relPath.toLowerCase().startsWith(`${normalized}/`));

  return sortPhotosByDate(filtered.slice());
};

export const getLocationMetadata = async () => {
  const photos = await getCachedPhotos();
  const metadata: Record<string, { count: number; heroImage: string | null }> = {};

  for (const photo of photos) {
    const countryLower = photo.country.toLowerCase();

    if (!metadata[countryLower]) {
      metadata[countryLower] = { count: 0, heroImage: null };
    }

    metadata[countryLower].count++;

    if (!metadata[countryLower].heroImage) {
      metadata[countryLower].heroImage = photo.src;
    }
  }

  return metadata;
};

export default createPhotos;
