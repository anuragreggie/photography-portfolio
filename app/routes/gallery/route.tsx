import { Container, Title, Text, Box, Center, Select, Group } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useViewportSize } from '@mantine/hooks';

// React Photo Album imports
import { RowsPhotoAlbum } from "react-photo-album";
import type { Photo } from "react-photo-album";
import "react-photo-album/rows.css";

import classes from './styles.module.css';
import photosPromise, { type PhotoWithCountry } from '../../data/photos';

export default function Gallery() {
  const [photos, setPhotos] = useState<PhotoWithCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(-1);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const { width } = useViewportSize();

  // Mobile breakpoint
  const isMobile = width < 768;

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

  // Get unique countries from photo data
  const countries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(photos.map(photo => photo.country).filter(Boolean)));
    return uniqueCountries.sort();
  }, [photos]);

  // Filter photos based on selected country
  const filteredPhotos = useMemo(() => {
    if (!selectedCountry) return photos;
    return photos.filter(photo => photo.country === selectedCountry);
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

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={classes.filterSection}
        >
          <Group justify="flex-end" gap="lg">
            <Select
              placeholder="All Locations"
              value={selectedCountry}
              onChange={setSelectedCountry}
              data={[
                { value: '', label: 'All Locations' },
                ...countries.map(country => ({ value: country, label: country }))
              ]}
              clearable
              variant="subtle"
              size="sm"
              w={180}
              styles={{
                input: {
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--mantine-color-dark-4)',
                  borderRadius: 0,
                  color: 'var(--mantine-color-dark-1)',
                  fontSize: '0.875rem',
                  fontWeight: 300,
                  textAlign: 'right',
                  '&:focus': {
                    borderBottomColor: 'var(--mantine-color-dark-2)',
                  },
                  '&::placeholder': {
                    color: 'var(--mantine-color-dark-3)',
                  },
                },
                dropdown: {
                  backgroundColor: 'var(--mantine-color-dark-7)',
                  border: '1px solid var(--mantine-color-dark-5)',
                },
                option: {
                  fontSize: '0.875rem',
                  '&[data-selected]': {
                    backgroundColor: 'var(--mantine-color-dark-5)',
                  },
                  '&[data-hovered]': {
                    backgroundColor: 'var(--mantine-color-dark-6)',
                  },
                },
              }}
            />
            {selectedCountry && (
              <Text size="xs" c="dark.3" fw={300}>
                {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}
              </Text>
            )}
          </Group>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className={classes.gallery}
          key={selectedCountry ?? 'all'} // Re-animate when filter changes
        >
          <RowsPhotoAlbum 
            photos={filteredPhotos} 
            onClick={({ index: clickIndex }) => setIndex(clickIndex)}
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
