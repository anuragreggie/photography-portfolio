import { Container, Title, Text, Grid, Box, Modal } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import classes from './styles.module.css';

const images = [
  { id: 1, title: 'Portrait Study', category: 'Portrait' },
  { id: 2, title: 'Urban Landscape', category: 'Landscape' },
  { id: 3, title: 'Street Photography', category: 'Street' },
  { id: 4, title: 'Abstract Composition', category: 'Abstract' },
  { id: 5, title: 'Nature Close-up', category: 'Nature' },
  { id: 6, title: 'Architectural Detail', category: 'Architecture' },
  { id: 7, title: 'Candid Moment', category: 'Street' },
  { id: 8, title: 'Minimalist Scene', category: 'Minimalist' },
  { id: 9, title: 'Golden Hour', category: 'Landscape' },
];

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

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
          <Text size="lg" c="dimmed" className={classes.subtitle}>
            A curated collection of my photographic work
          </Text>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className={classes.gallery}
        >
          <Grid gutter="md">
            {images.map((image, index) => (
              <Grid.Col 
                key={image.id} 
                span={{ base: 12, sm: 6, md: 4 }}
              >
                <motion.div
                  variants={fadeInUp}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={classes.imageCard}
                  onClick={() => setSelectedImage(image.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Box className={classes.imageWrapper}>
                    <Box className={classes.placeholderImage}>
                      <Text c="white" fw={300} ta="center" size="sm">
                        {image.title}
                      </Text>
                    </Box>
                    <div className={classes.overlay}>
                      <Text c="white" fw={500} size="md">
                        {image.title}
                      </Text>
                      <Text c="gray.3" size="sm">
                        {image.category}
                      </Text>
                    </div>
                  </Box>
                </motion.div>
              </Grid.Col>
            ))}
          </Grid>
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
              <Text c="white" ta="center" size="lg">
                {images.find(img => img.id === selectedImage)?.title}
              </Text>
            </Box>
          </motion.div>
        )}
      </Modal>
    </div>
  );
}
