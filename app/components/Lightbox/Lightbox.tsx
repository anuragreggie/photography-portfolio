import { motion } from 'framer-motion';
import { useCallback, useEffect } from 'react';
import classes from './Lightbox.module.css';

interface LightboxPhoto {
  src: string;
  alt?: string;
}

interface LightboxProps {
  photos: LightboxPhoto[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ photos, currentIndex, onClose, onNavigate }: LightboxProps) {
  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1);
  }, [hasPrev, currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1);
  }, [hasNext, currentIndex, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, handlePrev, handleNext]);

  if (!photo) return null;

  return (
    <motion.div
      className={classes.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={classes.content}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.src}
          alt={photo.alt || ''}
          className={classes.image}
        />

        <button
          className={classes.closeButton}
          onClick={onClose}
          aria-label="Close lightbox"
        >
          ×
        </button>

        {hasPrev && (
          <button
            className={`${classes.navButton} ${classes.prevButton}`}
            onClick={handlePrev}
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        {hasNext && (
          <button
            className={`${classes.navButton} ${classes.nextButton}`}
            onClick={handleNext}
            aria-label="Next image"
          >
            ›
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
