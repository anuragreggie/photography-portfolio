import type { ResponsiveSizes } from 'react-photo-album';

export const BREAKPOINTS = {
  mobile: 768,
} as const;

export const PHOTO_ALBUM_CONFIG = {
  rowConstraints: {
    mobile: { maxPhotos: 2, singleRowMaxHeight: 400 },
    desktop: { maxPhotos: 3, singleRowMaxHeight: 600 },
  },
  sizes: {
    // Mantine's xl container is capped at 1320px, including 16px gutters.
    size: 'min(calc(100vw - 32px), 1288px)',
  } satisfies ResponsiveSizes,
} as const;
