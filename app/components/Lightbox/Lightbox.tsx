import { FocusTrap, Portal } from '@mantine/core';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import classes from './Lightbox.module.css';
import { SwipeGesture } from './swipe';

interface LightboxPhoto {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  srcSet?: readonly { src: string; width: number }[];
}

interface LightboxProps {
  photos: readonly LightboxPhoto[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, []);
  const swipe = useRef(new SwipeGesture());
  useEffect(() => {
    swipe.current.cancel();
  }, [currentIndex]);
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
          e.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, handlePrev, handleNext]);

  if (!photo) return null;

  return (
    <Portal>
      <FocusTrap active>
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className={classes.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
          onTouchStartCapture={(event) => {
            if (event.touches.length > 1) swipe.current.cancel();
          }}
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
              srcSet={photo.srcSet
                ?.map((image) => `${image.src} ${image.width}w`)
                .join(', ')}
              sizes="(max-width: 768px) calc(100vw - 40px), 80vw"
              width={photo.width}
              height={photo.height}
              alt={photo.alt || ''}
              className={classes.image}
              draggable={false}
              onTouchStart={(event) => {
                swipe.current.start(
                  Array.from(event.touches),
                  event.timeStamp,
                  window.visualViewport?.scale ?? 1
                );
              }}
              onTouchMove={(event) => {
                swipe.current.move(
                  Array.from(event.touches),
                  window.visualViewport?.scale ?? 1
                );
              }}
              onTouchEnd={(event) => {
                const direction = swipe.current.end(
                  Array.from(event.changedTouches),
                  event.touches.length,
                  event.timeStamp,
                  window.visualViewport?.scale ?? 1
                );
                if (direction === 'next') handleNext();
                if (direction === 'previous') handlePrev();
              }}
              onTouchCancel={() => swipe.current.cancel()}
            />

            <button
              type="button"
              className={classes.closeButton}
              onClick={onClose}
              aria-label="Close lightbox"
              data-autofocus
            >
              <IconX size={20} />
            </button>

            {hasPrev && (
              <button
                type="button"
                className={`${classes.navButton} ${classes.prevButton}`}
                onClick={handlePrev}
                aria-label="Previous image"
              >
                <IconChevronLeft size={20} />
              </button>
            )}

            {hasNext && (
              <button
                type="button"
                className={`${classes.navButton} ${classes.nextButton}`}
                onClick={handleNext}
                aria-label="Next image"
              >
                <IconChevronRight size={20} />
              </button>
            )}
          </motion.div>
          <div
            className={classes.counter}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            onClick={(event) => event.stopPropagation()}
          >
            {currentIndex + 1} of {photos.length}
          </div>
        </motion.div>
      </FocusTrap>
    </Portal>
  );
}
