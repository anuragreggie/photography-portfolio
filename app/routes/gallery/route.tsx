import { Container, Title, Text, Grid, Box, Modal, Center } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { GalleryItem, WorldMap } from '../../components';
import classes from './styles.module.css';

// Real Norway images populated from /public/images/norway
interface PhotoMeta {
  id: number;
  file: string;
  title: string;
  country: string;
  description?: string;
}

const norwayFilenames = [
  'DSC03619.jpg','DSC03622.jpg','DSC03624.jpg','DSC03625.jpg','DSC03635.jpg','DSC03636.jpg','DSC03654.jpg','DSC03664.jpg','DSC03666.jpg','DSC03667.jpg','DSC03668.jpg','DSC03671.jpg','DSC03724.jpg','DSC03733.jpg','DSC03738.jpg','DSC03756.jpg','DSC03758.jpg','DSC03792.jpg','DSC03809.jpg','DSC03811.jpg','DSC03812.jpg','DSC03819.jpg','DSC03822.jpg','DSC03823.jpg','DSC03828.jpg','DSC03840.jpg','DSC03866.jpg','DSC03947.jpg','DSC03969.jpg','DSC03972.jpg','DSC03983.jpg','DSC03984.jpg','DSC04006.jpg','DSC04025.jpg','DSC04027.jpg','DSC04073.jpg','DSC04081.jpg','DSC04092.jpg','DSC04095.jpg','DSC04097.jpg'
];

const images: PhotoMeta[] = norwayFilenames.map((file, idx) => ({
  id: idx + 1,
  file: `/images/norway/${file}`,
  title: file.replace(/\.jpg$/i, '').replace(/DSC0*/i, 'Norway '),
  country: 'Norway',
}));

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
