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
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
}

const photoData = Object.entries(allImageModules)
  .map(([path, importFn], idx) => {
    const pathParts = path.split('/');
    const countryFolder = pathParts[pathParts.length - 2]; // Get folder name (country)
    const file = pathParts.pop() || `image-${idx}`;
    
    // Capitalize country name
    const country = countryFolder.charAt(0).toUpperCase() + countryFolder.slice(1).toLowerCase();
    
    const relPath = `${countryFolder}/${file}`;

    return {
      importFn,
      alt: file.replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/DSC0*/i, `${country} `),
      title: file.replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/DSC0*/i, `${country} `),
      country: country,
      relPath,
    };
  });

const createPhotos = async (): Promise<PhotoWithCountry[]> => {
  const photos: PhotoWithCountry[] = [];
  
  for (const { importFn, alt, title, country, relPath } of photoData) {
    try {
      // Dynamically import the image URL
      const src = await importFn();
      
      const exif = await parse(src).catch(() => null);
      const dateTaken = exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate;
      
      const { width, height } = await getImageDimensions(src);
      
      // Ensure valid dimensions before proceeding
      if (!width || !height || width <= 0 || height <= 0) {
        console.warn(`Invalid dimensions for image ${relPath}: ${width}x${height}`);
        continue;
      }
      
      photos.push({
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
      });
    } catch (error) {
      console.error(`Failed to load dimensions for image in ${relPath}:`, error);
      continue;
    }
  }
  
  photos.sort((a, b) => {
    // Ensure we have valid photos to compare
    if (!a || !b) return 0;
    
    const ad = a.dateTaken?.getTime();
    const bd = b.dateTaken?.getTime();
    
    if (ad && bd) return bd - ad; // newest first
    if (ad && !bd) return -1; // a has a date, b doesn't
    if (!ad && bd) return 1;  // b has a date, a doesn't
    
    // Deterministic fallback when EXIF is missing on both
    return (a.src || '').localeCompare(b.src || '');
  });
  
  return photos;
};

// Load photos for a specific location
export const createPhotosByLocation = async (locationFolder: string): Promise<PhotoWithCountry[]> => {
  const photos: PhotoWithCountry[] = [];
  
  const filteredPhotoData = photoData.filter(
    ({ relPath }) => relPath.toLowerCase().startsWith(locationFolder.toLowerCase())
  );
  
  for (const { importFn, alt, title, country, relPath } of filteredPhotoData) {
    try {
      const src = await importFn();
      const exif = await parse(src).catch(() => null);
      const dateTaken = exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate;
      const { width, height } = await getImageDimensions(src);
      
      if (!width || !height || width <= 0 || height <= 0) {
        console.warn(`Invalid dimensions for image ${relPath}: ${width}x${height}`);
        continue;
      }
      
      photos.push({
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
      });
    } catch (error) {
      console.error(`Failed to load dimensions for image in ${relPath}:`, error);
      continue;
    }
  }
  
  photos.sort((a, b) => {
    if (!a || !b) return 0;
    const ad = a.dateTaken?.getTime();
    const bd = b.dateTaken?.getTime();
    if (ad && bd) return bd - ad;
    if (ad && !bd) return -1;
    if (!ad && bd) return 1;
    return (a.src || '').localeCompare(b.src || '');
  });
  
  return photos;
};

// Get photo count and hero image for each location
export const getLocationMetadata = async () => {
  const metadata: Record<string, { count: number; heroImage: string | null }> = {};
  
  for (const { importFn, country, relPath } of photoData) {
    const countryLower = country.toLowerCase();
    
    if (!metadata[countryLower]) {
      metadata[countryLower] = { count: 0, heroImage: null };
    }
    
    metadata[countryLower].count++;
    
    // Set first image as hero image
    if (!metadata[countryLower].heroImage) {
      try {
        const src = await importFn();
        metadata[countryLower].heroImage = src;
      } catch (error) {
        console.error(`Failed to load hero image for ${relPath}:`, error);
      }
    }
  }
  
  return metadata;
};

export default createPhotos;
