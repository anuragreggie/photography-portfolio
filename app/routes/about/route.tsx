import { Container, Title, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import classes from './styles.module.css';

// Import images from assets
import sonyA6400 from '../../assets/images/sony-a6400.png';
import sigma1850 from '../../assets/images/sigma-18-50mm.jpg';

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

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={classes.equipmentSection}
          >
            <Title order={2} className={classes.sectionTitle}>
              Equipment
            </Title>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={classes.equipmentContent}
            >
              <div className={classes.equipmentImages}>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className={classes.equipmentCard}
                >
                  <div className={classes.equipmentImageWrapper}>
                    <img 
                      src={sonyA6400} 
                      alt="Sony A6400 Mirrorless Camera"
                      className={classes.equipmentMainImage}
                    />
                  </div>
                  <Text className={classes.imageLabel}>Sony A6400</Text>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className={classes.equipmentCard}
                >
                  <div className={classes.equipmentImageWrapper}>
                    <img 
                      src={sigma1850} 
                      alt="Sigma 18-50mm F2.8 DC DN Contemporary Lens"
                      className={classes.equipmentMainImage}
                    />
                  </div>
                  <Text className={classes.imageLabel}>Sigma 18-50mm F2.8</Text>
                </motion.div>
              </div>
              
              <div className={classes.equipmentDescription}>
                <Text className={classes.equipmentText}>
                  I primarily shoot with a <strong>Sony A6400</strong> paired with a <strong>Sigma 18-50mm F2.8 DC DN</strong> lens. 
                  This combo works great for a variety of photography styles, from portraits to landscapes, while being compact and travel-friendly.
                </Text>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Container>
    </div>
  );
}
