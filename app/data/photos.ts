import type { Photo } from "react-photo-album";
import pkg from 'exifr';


export type PhotoWithCountry = Photo & {
  country: string;
  dateTaken?: Date;
};

const {parse} = pkg;

const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

const allImageModules = import.meta.glob('../assets/images/*/*.{jpg,jpeg,png,webp}', {
  eager: true, 
  import: 'default' 
}) as Record<string, string>;

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
  .map(([path, url], idx) => {
    const pathParts = path.split('/');
    const countryFolder = pathParts[pathParts.length - 2]; // Get folder name (country)
    const file = pathParts.pop() || `image-${idx}`;
    
    // Capitalize country name
    const country = countryFolder.charAt(0).toUpperCase() + countryFolder.slice(1).toLowerCase();
    
    return {
      src: url,
      alt: file.replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/DSC0*/i, `${country} `),
      title: file.replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/DSC0*/i, `${country} `),
      country: country
    };
  });

const createPhotos = async (): Promise<PhotoWithCountry[]> => {
  const photos: PhotoWithCountry[] = [];
  
  for (const { src, alt, title, country } of photoData) {
    try {
      const exif = await parse(src).catch(() => null);
      const dateTaken = exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate;
      
      const { width, height } = await getImageDimensions(src);
      
      photos.push({
        src,
        width,
        height,
        alt,
        title,
        country,
        dateTaken: dateTaken ? new Date(dateTaken) : undefined,
        srcSet: breakpoints.map((breakpoint) => ({
          src,
          width: breakpoint,
          height: Math.round((height / width) * breakpoint),
        })),
      });
    } catch (error) {
      console.error(`Failed to load dimensions for ${src}:`, error);
      // Fallback with estimated dimensions if image fails to load
      // Using 3:2 aspect ratio which is common for photography
      photos.push({
        src,
        width: 1200,
        height: 800,
        alt,
        title,
        country,
        srcSet: breakpoints.map((breakpoint) => ({
          src,
          width: breakpoint,
          height: Math.round((800 / 1200) * breakpoint),
        })),
      });
    }
  }
  
  photos.sort((a, b) => {
    if (!a.dateTaken && !b.dateTaken) return 0;
    if (!a.dateTaken) return 1;
    if (!b.dateTaken) return -1;
    return b.dateTaken.getTime() - a.dateTaken.getTime();
  });
  
  return photos;
};

export default createPhotos;
