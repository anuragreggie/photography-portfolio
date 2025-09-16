import { Container, Title, Text, Grid, Box, Modal, Center } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { GalleryItem, WorldMap } from '../../components';
import classes from './styles.module.css';

// Dynamically import all Norway images placed under app/assets so Vite fingerprints & optimizes them.
// NOTE: We moved the JPG files from public/images/norway -> app/assets/images/norway
// This enables import.meta.glob. Public folder assets aren't processed by Vite and can't be globbed.
const norwayImageModules = import.meta.glob('../../assets/images/norway/*.jpg', {
  eager: true, 
  import: 'default' 
}) as Record<string, string>;
 
const images = Object.entries(norwayImageModules)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([path, url], idx) => {
    const file = path.split('/').pop() || `image-${idx}`;
    return {
      id: idx + 1,
      file: url,
      title: file.replace(/\.jpg$/i, '').replace(/DSC0*/i, 'Norway '),
      country: 'Norway'
  };
  });

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  // null indicates "all countries"
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Get unique countries for filter options
  const countries = useMemo(() => Array.from(new Set(images.map(i => i.country))).sort(), []);

  // Filter images based on selected country
  const filteredImages = useMemo(() => {
  if (!selectedCountry) return images;
  return images.filter(img => img.country === selectedCountry);
  }, [selectedCountry]);

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
          <Grid gutter="md">
            {filteredImages.map((image, index) => (
              <Grid.Col 
                key={image.id} 
                span={{ base: 12, sm: 6, md: 4 }}
              >
                <GalleryItem
                  title={image.title}
                  src={image.file}
                  onClick={() => setSelectedImage(image.id)}
                />
              </Grid.Col>
            ))}
          </Grid>
          
          {filteredImages.length === 0 && (
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

      <Modal
        opened={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        size="90%"
        padding={0}
        withCloseButton={false}
        centered
        className={classes.modal}
      >
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={classes.modalContent}
          >
            <Box className={classes.modalImage}>
              <Text c="dark.0" ta="center" size="lg">
                {images.find(img => img.id === selectedImage)?.title}
              </Text>
              <Text c="dark.2" ta="center" size="sm" mt="xs">
                {images.find(img => img.id === selectedImage)?.country}
              </Text>
            </Box>
          </motion.div>
        )}
      </Modal>
    </div>
  );
}
