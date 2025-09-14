import { Box, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import classes from './GalleryItem.module.css';

export interface GalleryItemProps {
  title: string;
  onClick?: () => void;
}

export const imageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

export default function GalleryItem({ 
  title, 
  onClick
}: GalleryItemProps) {
  return (
    <motion.div 
      variants={imageVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <Box className={classes.imageWrapper}>
        <Box className={classes.placeholderImage}>
          <Text c="dark.9" ta="center" size="sm" fw={300}>
            {title}
          </Text>
        </Box>
        <div className={classes.overlay}>
          <Text c="dark.0" fw={500} size="md" ta="center">
            {title}
          </Text>
        </div>
      </Box>
    </motion.div>
  );
}
