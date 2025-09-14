import { Container, Title, Text, Button, Stack, Grid, Image, Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router';
import classes from './styles.module.css';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: 'easeOut' }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  return (
    <div className={classes.page}>
      {/* Hero Section */}
      <section className={classes.hero}>
        <Container size="xl" className={classes.heroContainer}>
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className={classes.heroContent}
          >
            <motion.div variants={fadeInUp}>
              <Title order={1} className={classes.heroTitle}>
                Capturing Moments,
                <br />
                Creating Stories
              </Title>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Text size="lg" c="dimmed" className={classes.heroSubtitle}>
                Artisanal photography that transforms fleeting moments into timeless art
              </Text>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Button
                component={NavLink}
                to="/gallery"
                size="lg"
                variant="outline"
                color="dark"
                className={classes.heroButton}
              >
                View Gallery
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Featured Work */}
      <section className={classes.featured}>
        <Container size="xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Title order={2} ta="center" mb="xl" className={classes.sectionTitle}>
              Featured Work
            </Title>
          </motion.div>
          
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={classes.imageWrapper}
              >
                <Box className={classes.placeholderImage}>
                  <Text c="dimmed" ta="center">
                    Featured Photography 1
                  </Text>
                </Box>
              </motion.div>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className={classes.imageWrapper}
              >
                <Box className={classes.placeholderImage}>
                  <Text c="dimmed" ta="center">
                    Featured Photography 2
                  </Text>
                </Box>
              </motion.div>
            </Grid.Col>
          </Grid>
        </Container>
      </section>
    </div>
  );
}
