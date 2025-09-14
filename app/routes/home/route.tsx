import { Container, Text, Grid, } from '@mantine/core';
import { motion } from 'framer-motion';
import { GalleryItem } from '../../components';
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
                <GalleryItem title="Portrait Photography" />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <GalleryItem title="Landscape Photography" />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <GalleryItem title="Street Photography" />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <GalleryItem title="Event Photography" />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <GalleryItem title="Wedding Photography" />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <GalleryItem title="Fine Art Photography" />
              </Grid.Col>
            </Grid>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
