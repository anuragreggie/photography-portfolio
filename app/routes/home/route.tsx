import { Container, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { useViewportSize } from '@mantine/hooks';
import { useLoaderData } from 'react-router';
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";

import classes from './styles.module.css';
import { createPhotosByPaths, type PhotoWithCountry } from '../../data/photos';
import { BREAKPOINTS, ANIMATION, PHOTO_ALBUM_CONFIG } from '../../constants';

const fixedImagePaths = [
  'japan/tokyo-tower-through-leaves.jpg',
  'japan/shinkansen-driver-v2.jpg',
  'hong-kong/DSC05828.jpg',
  'norway/DSC04092.jpg',
  'norway/DSC04025.jpg',
  'switzerland/DSC06483.jpg',
  'japan/tokyo-skyline.png',
  'norway/DSC03654.jpg',
  'norway/DSC03947.jpg',
];

export async function clientLoader() {
  const fixedPhotos = await createPhotosByPaths(fixedImagePaths);
  return { fixedPhotos };
}

clientLoader.hydrate = true as const;

export default function Home() {
  const { fixedPhotos } = useLoaderData<{ fixedPhotos: PhotoWithCountry[] }>();
  const { width } = useViewportSize();
  const isMobile = width < BREAKPOINTS.mobile;

  const rowConstraints = isMobile
    ? PHOTO_ALBUM_CONFIG.rowConstraints.mobile
    : PHOTO_ALBUM_CONFIG.rowConstraints.desktop;

  return (
    <div className={classes.page}>
      <section className={classes.header}>
        <Container size="xl">
          <motion.div
            {...ANIMATION.fadeInUp}
            transition={{ duration: ANIMATION.duration.slow }}
            className={classes.headerContent}
          >
            <Text className={classes.pageTitle}>Life Through Optics</Text>
          </motion.div>
        </Container>
      </section>

      <section className={classes.gallery}>
        <Container size="xl">
          <motion.div
            {...ANIMATION.fadeInUpLarge}
            transition={{ duration: ANIMATION.duration.slow, delay: 0.3, ease: 'easeOut' }}
          >
            {fixedPhotos.length > 0 ? (
              <RowsPhotoAlbum
                photos={fixedPhotos}
                rowConstraints={rowConstraints}
                sizes={PHOTO_ALBUM_CONFIG.sizes}
                componentsProps={{ image: { loading: 'eager' } }}
              />
            ) : (
              <Text ta="center" py="xl">Images coming soon.</Text>
            )}
          </motion.div>
        </Container>
      </section>
    </div>
  );
}