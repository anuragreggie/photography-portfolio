import { Container, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useViewportSize } from '@mantine/hooks';

import { RowsPhotoAlbum } from "react-photo-album";
import type { Photo } from "react-photo-album";
import "react-photo-album/rows.css";

import classes from './styles.module.css';
import createPhotos from '../../data/photos';

const fixedImagePaths = [
  'japan/tokyo-tower-through-leaves.jpg',
  'japan/shinkansen-driver-v2.jpg',
  'italy/DSC01844.jpg',
  'norway/DSC04092.jpg',
  'norway/DSC04025.jpg',
  'france/eiffel-from-streets.jpg',
  'japan/tokyo-skyline.png',
  'norway/DSC03654.jpg',
  'norway/DSC03947.jpg',
];





export default function Home() {
  const [fixedPhotos, setFixedPhotos] = useState<Photo[] | null>(null);
  const { width } = useViewportSize();
  const isMobile = width < 768;

  useEffect(() => {
    createPhotos()
      .then((loadedPhotos) => {
        const filtered = fixedImagePaths.map(relPath =>
          loadedPhotos.find(photo => photo.src.includes(`/assets/images/${relPath}`))!
        );
        setFixedPhotos(filtered);
      })
      .catch((error) => {
        console.error("Failed to load photos:", error);
        setFixedPhotos([]);
      });
  }, []);

  if (!fixedPhotos) {
    return (
      <div className={classes.page}>
        <section className={classes.header}>
          <Container size="xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={classes.headerContent}
            >
              <Text className={classes.pageTitle}>
                Life Through Optics
              </Text>
            </motion.div>
          </Container>
        </section>
        <Container size="xl">
          <Text ta="center" py="xl">Loading photos...</Text>
        </Container>
      </div>
    );
  }

  return (
    <div className={classes.page}>
      {/* Header Section */}
      <section className={classes.header}>
        <Container size="xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={classes.headerContent}
          >
            <Text className={classes.pageTitle}>
              Life Through Optics
            </Text>
          </motion.div>
        </Container>
      </section>

      {/* Gallery Grid */}
      <section className={classes.gallery}>
        <Container size="xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            <RowsPhotoAlbum 
              photos={fixedPhotos} 
              rowConstraints={{
                maxPhotos: isMobile ? 2 : 3,
                singleRowMaxHeight: isMobile ? 400 : 600,
              }}
              sizes={{
                size: "calc(100vw - 40px)",
                sizes: [
                  { viewport: "(max-width: 768px)", size: "calc(100vw - 32px)" },
                  { viewport: "(min-width: 769px)", size: "calc(100vw - 80px)" },
                ],
              }}
            />
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
