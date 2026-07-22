import { Container, Title, Text, Box, Center, Button } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useViewportSize } from '@mantine/hooks';
import { useLoaderData, Link, redirect } from 'react-router';
import { IconArrowLeft } from '@tabler/icons-react';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';

import { Lightbox } from '../../components/Lightbox';
import classes from './styles.module.css';
import { createPhotosByLocation, type PortfolioPhoto } from '../../data/photos';
import { getLocationByFolder, type Location } from '../../data/locations';
import { BREAKPOINTS, ANIMATION, PHOTO_ALBUM_CONFIG } from '../../constants';

export function clientLoader({ params }: { params: { location: string } }) {
  const locationFolder = params.location;
  const location = getLocationByFolder(locationFolder);

  if (!location) {
    throw redirect('/gallery');
  }

  const photos = createPhotosByLocation(location.folder);

  return { photos, location };
}

clientLoader.hydrate = true as const;

export default function LocationGallery() {
  const { photos, location } = useLoaderData<{
    photos: PortfolioPhoto[];
    location: Location;
  }>();
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const { width } = useViewportSize();

  const isMobile = width < BREAKPOINTS.mobile;
  const isLightboxOpen = lightboxIndex >= 0;

  const rowConstraints = isMobile
    ? PHOTO_ALBUM_CONFIG.rowConstraints.mobile
    : PHOTO_ALBUM_CONFIG.rowConstraints.desktop;

  const handleCloseLightbox = useCallback(() => setLightboxIndex(-1), []);
  const handleNavigate = useCallback(
    (index: number) => setLightboxIndex(index),
    []
  );

  return (
    <div className={classes.page}>
      <Container size="xl" py="xl">
        <motion.div
          {...ANIMATION.fadeInUp}
          transition={{ duration: ANIMATION.duration.normal }}
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
          {...ANIMATION.fadeInUpHero}
          transition={{ duration: ANIMATION.duration.slow }}
          className={classes.header}
        >
          <Title order={1} className={classes.title}>
            {location.name}
          </Title>
        </motion.div>

        <motion.div
          {...ANIMATION.fadeInUpLarge}
          transition={{
            duration: ANIMATION.duration.slow,
            delay: 0.3,
            ease: 'easeOut',
          }}
          className={classes.gallery}
        >
          {photos.length > 0 ? (
            <RowsPhotoAlbum
              photos={photos}
              onClick={({ index: clickIndex }) => setLightboxIndex(clickIndex)}
              rowConstraints={rowConstraints}
              sizes={PHOTO_ALBUM_CONFIG.sizes}
              componentsProps={{ image: { loading: 'lazy' } }}
            />
          ) : (
            <Box py="xl" my="xl">
              <motion.div
                {...ANIMATION.fadeIn}
                transition={{ duration: ANIMATION.duration.normal }}
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

      {isLightboxOpen && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={handleCloseLightbox}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
