import { Container, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import { RowsPhotoAlbum } from "react-photo-album";
import type { Photo } from "react-photo-album";
import "react-photo-album/rows.css";

import classes from './styles.module.css';
import photosPromise from '../../data/photos';

function getRandomPhotos(photos: Photo[], count: number = 9): Photo[] {
  const shuffled = [...photos].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [randomPhotos, setRandomPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    photosPromise
      .then((loadedPhotos) => {
        setPhotos(loadedPhotos);
        setRandomPhotos(getRandomPhotos(loadedPhotos, 9));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load photos:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
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
              photos={randomPhotos} 
              rowConstraints={{ maxPhotos: 3 }}
            />
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
