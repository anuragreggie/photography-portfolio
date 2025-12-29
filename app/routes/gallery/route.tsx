import { Container, Title, SimpleGrid, Image, Text, Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { locations } from '../../data/locations';

import classes from './styles.module.css';

export default function GalleryOverview() {

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
                key={location.folder}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Box
                  component={Link}
                  to={`/gallery/${location.folder}`}
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  <Box className={classes.locationCard}>
                    <Image
                      src={location.heroImage}
                      alt={location.name}
                      height={300}
                      fit="cover"
                      className={classes.locationImage}
                      loading="lazy"
                    />
                  </Box>
                  <Text 
                    size="sm" 
                    mt="xs" 
                    c="dark.0"
                    fw={500}
                    ta="center"
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
