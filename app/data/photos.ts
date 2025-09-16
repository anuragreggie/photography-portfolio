import type { Photo } from "react-photo-album";

const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

const norwayImageModules = import.meta.glob('../assets/images/norway/*.jpg', {
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

const photoData = Object.entries(norwayImageModules)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([path, url], idx) => {
    const file = path.split('/').pop() || `image-${idx}`;
    return {
      src: url,
      alt: file.replace(/\.jpg$/i, '').replace(/DSC0*/i, 'Norway '),
      title: file.replace(/\.jpg$/i, '').replace(/DSC0*/i, 'Norway '),
      country: 'Norway'
    };
  });

const createPhotos = async (): Promise<Photo[]> => {
  const photos: Photo[] = [];
  
  for (const { src, alt, title } of photoData) {
    try {
      const { width, height } = await getImageDimensions(src);
      
      photos.push({
        src,
        width,
        height,
        alt,
        title,
        srcSet: breakpoints.map((breakpoint) => ({
          src,
          width: breakpoint,
          height: Math.round((height / width) * breakpoint),
        })),
      });
    } catch (error) {
      console.error(`Failed to load dimensions for ${src}:`, error);
      // Fallback with estimated dimensions if image fails to load
      photos.push({
        src,
        width: 800,
        height: 600,
        alt,
        title,
        srcSet: breakpoints.map((breakpoint) => ({
          src,
          width: breakpoint,
          height: Math.round((600 / 800) * breakpoint),
        })),
      });
    }
  }
  
  return photos;
};

export default createPhotos();
