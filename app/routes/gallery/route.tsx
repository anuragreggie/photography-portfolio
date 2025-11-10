import { Container, Title, SimpleGrid, Image, Text, Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { Link, useLoaderData } from 'react-router';
import { locations, type Location } from '../../data/locations';
import { getLocationMetadata } from '../../data/photos';

import classes from './styles.module.css';

export async function clientLoader() {
  const metadata = await getLocationMetadata();
  
  // Enrich locations with metadata
  const enrichedLocations = locations.map(loc => ({
    ...loc,
    heroImage: metadata[loc.folder.toLowerCase()]?.heroImage || null,
    photoCount: metadata[loc.folder.toLowerCase()]?.count || 0,
  }));
  
  return { locations: enrichedLocations };
}

clientLoader.hydrate = true as const;

interface EnrichedLocation extends Omit<Location, 'heroImage'> {
  heroImage: string | null;
  photoCount: number;
}

export default function GalleryOverview() {
  const { locations } = useLoaderData<{ locations: EnrichedLocation[] }>();

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
            Travel
          </Title>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 4 }}
            spacing="lg"
            mt="xl"
          >
            {locations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Box
                  component={Link}
                  to={`/gallery/${location.slug}`}
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  <Box className={classes.locationCard}>
                    {location.heroImage ? (
                      <Image
                        src={location.heroImage}
                        alt={location.name}
                        height={300}
                        fit="cover"
                        className={classes.locationImage}
                      />
                    ) : (
                      <Box
                        h={300}
                        style={{
                          backgroundColor: 'var(--mantine-color-dark-6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text c="dark.3" size="xl">
                          {location.name}
                        </Text>
                      </Box>
                    )}
                  </Box>
                  <Text 
                    size="sm" 
                    mt="xs" 
                    c="dark.0"
                    fw={400}
                  >
                    {location.name}
                  </Text>
                </Box>
              </motion.div>
            ))}
          </SimpleGrid>
        </motion.div>
      </Container>
    </div>
  );
}
