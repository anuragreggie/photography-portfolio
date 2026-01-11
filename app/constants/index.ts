export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
} as const;

export const ANIMATION = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  fadeInUpLarge: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
  },
  fadeInUpHero: {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  duration: {
    fast: 0.3,
    normal: 0.5,
    slow: 0.8,
  },
} as const;

export const PHOTO_ALBUM_CONFIG = {
  rowConstraints: {
    mobile: { maxPhotos: 2, singleRowMaxHeight: 400 },
    desktop: { maxPhotos: 3, singleRowMaxHeight: 600 },
  },
  sizes: {
    size: "calc(100vw - 40px)",
    sizes: [
      { viewport: "(max-width: 768px)", size: "calc(100vw - 32px)" },
      { viewport: "(min-width: 769px)", size: "calc(100vw - 80px)" },
    ],
  },
} as const;
