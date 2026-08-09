import { Container, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { useViewportSize } from '@mantine/hooks';
import { useLoaderData } from 'react-router';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';

import classes from './styles.module.css';
import { createPhotosByPaths, type PortfolioPhoto } from '../../data/photos';
import { BREAKPOINTS, ANIMATION, PHOTO_ALBUM_CONFIG } from '../../constants';

const fixedImagePaths = [
  'united-states/DSC08453.jpg',
  'japan/DSC02897.jpg',
  'uk/DSC07626.jpg',
  'hong-kong/DSC05828.jpg',
  'japan/shinkansen-driver-v2.jpg',
  'switzerland/DSC06483.jpg',
  'japan/tokyo-tower-through-leaves.jpg',
  'norway/DSC03654.jpg',
  'norway/DSC03947.jpg',
];

const ABOVE_THE_FOLD_IMAGES = {
  mobile: 2,
  desktop: 3,
} as const;

export function clientLoader() {
  const fixedPhotos = createPhotosByPaths(fixedImagePaths);
  return { fixedPhotos };
}

clientLoader.hydrate = true as const;

export default function Home() {
  const { fixedPhotos } = useLoaderData<{ fixedPhotos: PortfolioPhoto[] }>();
  const { width } = useViewportSize();
  const isMobile = width < BREAKPOINTS.mobile;

  const rowConstraints = isMobile
    ? PHOTO_ALBUM_CONFIG.rowConstraints.mobile
    : PHOTO_ALBUM_CONFIG.rowConstraints.desktop;
  const eagerPhotoCount = isMobile
    ? ABOVE_THE_FOLD_IMAGES.mobile
    : ABOVE_THE_FOLD_IMAGES.desktop;

  return (
    <div className={classes.page}>
      <section className={classes.header}>
        <Container size="xl">
          <div className={classes.headerContent}>
            <Text className={classes.pageTitle}>Life Through Optics</Text>
          </div>
        </Container>
      </section>

      <section className={classes.gallery}>
        <Container size="xl">
          <motion.div
            {...ANIMATION.fadeInUpLarge}
            transition={{
              duration: ANIMATION.duration.slow,
              delay: 0.3,
              ease: 'easeOut',
            }}
          >
            {fixedPhotos.length > 0 ? (
              <RowsPhotoAlbum
                photos={fixedPhotos}
                rowConstraints={rowConstraints}
                sizes={PHOTO_ALBUM_CONFIG.sizes}
                componentsProps={{
                  image: ({ index }) => ({
                    loading: index < eagerPhotoCount ? 'eager' : 'lazy',
                    fetchPriority:
                      index === 0
                        ? 'high'
                        : index < eagerPhotoCount
                          ? 'auto'
                          : 'low',
                    decoding: 'async',
                  }),
                }}
              />
            ) : (
              <Text ta="center" py="xl">
                Images coming soon.
              </Text>
            )}
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
