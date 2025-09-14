import { Container, Title, Text, Grid, Box, Image } from '@mantine/core';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router';
import classes from './styles.module.css';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const imageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

export default function Home() {
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
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <motion.div variants={imageVariants}>
                  <Box className={classes.imageWrapper}>
                    <Box className={classes.placeholderImage}>
                      <Text c="dark.0" ta="center" size="sm" fw={300}>
                        Portrait Photography
                      </Text>
                    </Box>
                  </Box>
                </motion.div>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <motion.div variants={imageVariants}>
                  <Box className={classes.imageWrapper}>
                    <Box className={classes.placeholderImage}>
                      <Text c="dark.0" ta="center" size="sm" fw={300}>
                        Landscape Photography
                      </Text>
                    </Box>
                  </Box>
                </motion.div>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <motion.div variants={imageVariants}>
                  <Box className={classes.imageWrapper}>
                    <Box className={classes.placeholderImage}>
                      <Text c="dark.0" ta="center" size="sm" fw={300}>
                        Street Photography
                      </Text>
                    </Box>
                  </Box>
                </motion.div>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <motion.div variants={imageVariants}>
                  <Box className={classes.imageWrapper}>
                    <Box className={classes.placeholderImage}>
                      <Text c="dark.0" ta="center" size="sm" fw={300}>
                        Event Photography
                      </Text>
                    </Box>
                  </Box>
                </motion.div>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <motion.div variants={imageVariants}>
                  <Box className={classes.imageWrapper}>
                    <Box className={classes.placeholderImage}>
                      <Text c="dark.0" ta="center" size="sm" fw={300}>
                        Wedding Photography
                      </Text>
                    </Box>
                  </Box>
                </motion.div>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <motion.div variants={imageVariants}>
                  <Box className={classes.imageWrapper}>
                    <Box className={classes.placeholderImage}>
                      <Text c="dark.0" ta="center" size="sm" fw={300}>
                        Fine Art Photography
                      </Text>
                    </Box>
                  </Box>
                </motion.div>
              </Grid.Col>
            </Grid>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
