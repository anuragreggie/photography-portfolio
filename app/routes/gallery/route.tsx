import { Container, Title, Text, Box, Center } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

// React Photo Album imports
import { RowsPhotoAlbum } from "react-photo-album";
import type { Photo } from "react-photo-album";
import "react-photo-album/rows.css";

import { WorldMap } from '../../components';
import classes from './styles.module.css';
import photosPromise from '../../data/photos';

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(-1);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    photosPromise
      .then((loadedPhotos) => {
        setPhotos(loadedPhotos);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load photos:", error);
        setLoading(false);
      });
  }, []);

  // Get unique countries for filter options (assuming photos have country metadata)
  const countries = useMemo(() => {
    // For now, just return Norway since that's what we have
    return ['Norway'];
  }, []);

  // Filter photos based on selected country
  const filteredPhotos = useMemo(() => {
    if (!selectedCountry) return photos;
    // For now, return all photos since they're all Norway photos
    return photos;
  }, [selectedCountry, photos]);

  if (loading) {
    return (
      <div className={classes.page}>
        <Container size="xl" py="xl">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={classes.header}
          >
            <Title order={1} className={classes.title}>
              Gallery
            </Title>
          </motion.div>
          <Center py="xl">
            <Text>Loading photos...</Text>
          </Center>
        </Container>
      </div>
    );
  }

  return (
    <div className={classes.page}>
      <Container size="xl" py="xl">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={classes.header}
        >
          <Title order={1} className={classes.title}>
            Gallery
          </Title>
        </motion.div>

        {/* Interactive World Map Filter */}
        <Box mb="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <WorldMap
              selectedCountry={selectedCountry}
              onCountrySelect={setSelectedCountry}
              availableCountries={countries}
            />
          </motion.div>
        </Box>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className={classes.gallery}
          key={selectedCountry ?? 'all'} // Re-animate when filter changes
        >
          <RowsPhotoAlbum 
            photos={filteredPhotos} 
            onClick={({ index: clickIndex }) => setIndex(clickIndex)} 
          />
          
          {filteredPhotos.length === 0 && (
            <Box py="xl" my="xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Center>
                  <Text c="dark.2" size="lg">
                    No images found for {selectedCountry}
                  </Text>
                </Center>
              </motion.div>
            </Box>
          )}
        </motion.div>
      </Container>

      {/* Simple lightbox overlay */}
      {index >= 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIndex(-1)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredPhotos[index]?.src}
              alt={filteredPhotos[index]?.alt}
              style={{
                maxWidth: '80vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <button
              onClick={() => setIndex(-1)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ×
            </button>
            {/* Navigation buttons */}
            {index > 0 && (
              <button
                onClick={() => setIndex(index - 1)}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ‹
              </button>
            )}
            {index < filteredPhotos.length - 1 && (
              <button
                onClick={() => setIndex(index + 1)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ›
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
