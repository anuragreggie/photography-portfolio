import { Container, Title, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import classes from './styles.module.css';

export default function About() {
  return (
    <div className={classes.page}>
      <Container size="lg" py="xl">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={classes.header}
        >
          <Title order={1} className={classes.title}>
            About
          </Title>
          <Text size="lg" c="dark.0" className={classes.subtitle}>
            Capturing moments, creating memories
          </Text>
        </motion.div>

        <Container size="md" className={classes.content}>
          <Text className={classes.description}>
            Welcome to my photography portfolio. I'm passionate about capturing 
            life's precious moments through the lens, creating timeless images 
            that tell your unique story.
          </Text>
        </Container>
      </Container>
    </div>
  );
}
