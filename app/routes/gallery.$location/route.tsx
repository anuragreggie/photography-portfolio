import { Container, Title, Text, Box, Center, Button } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useViewportSize } from '@mantine/hooks';
import { useLoaderData, Link, redirect } from 'react-router';
import { IconArrowLeft } from '@tabler/icons-react';

import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";

import classes from './styles.module.css';
import { createPhotosByLocation, type PhotoWithCountry } from '../../data/photos';
import { getLocationByFolder, type Location } from '../../data/locations';

export async function clientLoader({ params }: { params: { location: string } }) {
  const locationFolder = params.location;
  const location = getLocationByFolder(locationFolder);

  if (!location) {
    throw redirect('/gallery');
  }
  
  const photos = await createPhotosByLocation(location.folder);
  
  return { photos, location };
}

clientLoader.hydrate = true as const;

export default function LocationGallery() {
  const { photos, location } = useLoaderData<{ photos: PhotoWithCountry[]; location: Location }>();
  const [index, setIndex] = useState(-1);
  const { width } = useViewportSize();

  // Mobile breakpoint
  const isMobile = width < 768;

  return (
    <div className={classes.page}>
      <Container size="xl" py="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={classes.backButton}
        >
          <Button
            component={Link}
            to="/gallery"
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            size="sm"
          >
            Back to Travel Portfolio
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={classes.header}
        >
          <Title order={1} className={classes.title}>
            {location.name}
          </Title>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className={classes.gallery}
        >
          {photos.length > 0 ? (
            <RowsPhotoAlbum 
              photos={photos} 
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
              componentsProps={{
                image: {
                  loading: 'lazy',
                },
              }}
            />
          ) : (
            <Box py="xl" my="xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Center>
                  <Text c="dark.2" size="lg">
                    No images found for {location.name}
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
              src={photos[index]?.src}
              alt={photos[index]?.alt}
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
            {index < photos.length - 1 && (
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
