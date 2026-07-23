import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData } from 'react-router';

import { Lightbox } from '../../components/Lightbox';
import { locations } from '../../data/locations';
import { createAllPhotos, type PortfolioPhoto } from '../../data/photos';
import classes from './styles.module.css';

type SceneLayout = 'feature' | 'contact' | 'film';

type ScenePhoto = {
  photo: PortfolioPhoto;
  index: number;
};

type BookScene = {
  id: string;
  layout: SceneLayout;
  chapterIndex: number;
  chapterSpread: number;
  chapterSpreadCount: number;
  locationName: string;
  photos: ScenePhoto[];
};

type SceneStyle = CSSProperties & {
  '--columns'?: number;
  '--progress'?: string;
};

const MAX_PHOTOS_PER_SPREAD = 10;

const DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
});

const locationNames = new Map(
  locations.map((location) => [location.folder, location.name])
);

function photoTime(photo: PortfolioPhoto) {
  const time = photo.dateTaken?.getTime();
  return time && !Number.isNaN(time) ? time : 0;
}

function orderPhotosByTrip(photos: PortfolioPhoto[]) {
  const grouped = new Map<string, PortfolioPhoto[]>();

  for (const photo of photos) {
    const group = grouped.get(photo.locationFolder) ?? [];
    group.push(photo);
    grouped.set(photo.locationFolder, group);
  }

  return [...grouped.entries()]
    .map(([folder, tripPhotos]) => ({
      folder,
      photos: tripPhotos.sort(
        (a, b) => photoTime(a) - photoTime(b) || a.src.localeCompare(b.src)
      ),
      latestDate: Math.max(...tripPhotos.map(photoTime)),
    }))
    .sort((a, b) => b.latestDate - a.latestDate)
    .flatMap((trip) => trip.photos);
}

export function clientLoader() {
  return { photos: orderPhotosByTrip(createAllPhotos()) };
}

clientLoader.hydrate = true as const;

function spreadCounts(photoCount: number) {
  const spreadCount = Math.ceil(photoCount / MAX_PHOTOS_PER_SPREAD);
  const baseCount = Math.floor(photoCount / spreadCount);
  const remainder = photoCount % spreadCount;

  return Array.from(
    { length: spreadCount },
    (_, index) => baseCount + (index < remainder ? 1 : 0)
  );
}

function selectAnchor(photos: ScenePhoto[]) {
  const landscapeIndex = photos.findIndex(
    ({ photo }) => photo.width / photo.height >= 1.2
  );

  if (landscapeIndex <= 0) return photos;

  return [
    photos[landscapeIndex],
    ...photos.slice(0, landscapeIndex),
    ...photos.slice(landscapeIndex + 1),
  ];
}

function createScenes(photos: PortfolioPhoto[]): BookScene[] {
  const trips = new Map<string, ScenePhoto[]>();

  photos.forEach((photo, index) => {
    const trip = trips.get(photo.locationFolder) ?? [];
    trip.push({ photo, index });
    trips.set(photo.locationFolder, trip);
  });

  return [...trips.entries()].flatMap(
    ([locationFolder, tripPhotos], chapterIndex) => {
      const counts = spreadCounts(tripPhotos.length);
      let photoIndex = 0;

      return counts.map((count, chapterSpread) => {
        const spreadPhotos = tripPhotos.slice(photoIndex, photoIndex + count);
        const layout: SceneLayout =
          chapterSpread === 0
            ? 'feature'
            : chapterSpread % 2 === 1
              ? 'contact'
              : 'film';
        photoIndex += spreadPhotos.length;

        return {
          id: `chapter-${chapterIndex + 1}-spread-${chapterSpread + 1}`,
          layout,
          chapterIndex,
          chapterSpread,
          chapterSpreadCount: counts.length,
          locationName: locationNames.get(locationFolder) ?? locationFolder,
          photos:
            layout === 'contact' ? spreadPhotos : selectAnchor(spreadPhotos),
        };
      });
    }
  );
}

function formatDate(date?: Date) {
  if (!date || Number.isNaN(date.getTime())) return 'June 2025';
  return DATE_FORMATTER.format(date);
}

function imageSrcSet(photo: PortfolioPhoto) {
  return photo.srcSet
    ?.map((image) => `${image.src} ${image.width}w`)
    .join(', ');
}

function imageSizes(layout: SceneLayout, position: number) {
  if (position === 0 && layout !== 'contact') {
    return '(max-width: 700px) 92vw, 48vw';
  }

  if (layout === 'contact') {
    return '(max-width: 700px) 46vw, 20vw';
  }

  return '(max-width: 700px) 24vw, 15vw';
}

export default function GalleryOverview() {
  const { photos } = useLoaderData<{ photos: PortfolioPhoto[] }>();
  const [activeScene, setActiveScene] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [bookVisible, setBookVisible] = useState(true);
  const bookRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<Array<HTMLElement | null>>([]);
  const shouldReduceMotion = useReducedMotion();
  const scenes = useMemo(() => createScenes(photos), [photos]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(index)) setActiveScene(index);
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    sceneRefs.current.forEach((scene) => {
      if (scene) observer.observe(scene);
    });

    return () => observer.disconnect();
  }, [scenes.length]);

  useEffect(() => {
    const book = bookRef.current;
    if (!book) return;

    const observer = new IntersectionObserver(
      ([entry]) => setBookVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(book);

    return () => observer.disconnect();
  }, []);

  const goToScene = useCallback(
    (index: number) => {
      setActiveScene(index);
      sceneRefs.current[index]?.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    },
    [shouldReduceMotion]
  );

  const currentScene = scenes[activeScene];
  const progress =
    scenes.length > 1 ? (activeScene / (scenes.length - 1)) * 100 : 0;
  const scrubberStyle: SceneStyle = { '--progress': `${progress}%` };

  function renderPhoto(
    { photo, index }: ScenePhoto,
    position: number,
    layout: SceneLayout,
    sceneIndex: number
  ) {
    return (
      <motion.button
        key={photo.src}
        type="button"
        className={classes.shot}
        onClick={() => setLightboxIndex(index)}
        aria-label={`Open photograph ${index + 1} of ${photos.length}`}
        initial={
          shouldReduceMotion
            ? false
            : { opacity: 0, y: position === 0 ? 8 : 14 }
        }
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.55,
          delay: shouldReduceMotion ? 0 : Math.min(position * 0.035, 0.2),
        }}
      >
        <img
          src={photo.src}
          srcSet={imageSrcSet(photo)}
          sizes={imageSizes(layout, position)}
          alt={photo.alt || ''}
          className={classes.photo}
          loading={sceneIndex < 2 ? 'eager' : 'lazy'}
          fetchPriority={sceneIndex === 0 && position === 0 ? 'high' : 'auto'}
          decoding="async"
        />
      </motion.button>
    );
  }

  return (
    <div className={classes.page} ref={bookRef}>
      <main className={classes.book} aria-label="Photography gallery">
        {scenes.map((scene, sceneIndex) => {
          const sceneDate = formatDate(scene.photos[0]?.photo.dateTaken);
          const columns = Math.ceil(scene.photos.length / 2);
          const sceneStyle: SceneStyle = { '--columns': columns };
          const leadPhoto = scene.photos[0];
          const supportingPhotos = scene.photos.slice(1);

          return (
            <motion.section
              key={scene.id}
              id={scene.id}
              ref={(element) => {
                sceneRefs.current[sceneIndex] = element;
              }}
              data-index={sceneIndex}
              className={`${classes.scene} ${classes[scene.layout]}`}
              initial={shouldReduceMotion ? false : { opacity: 0.65 }}
              whileInView={{ opacity: 1 }}
              viewport={{ amount: 0.2 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.65 }}
              aria-label={`${scene.locationName}, ${sceneDate}`}
            >
              <header className={classes.sceneHeader}>
                <span>
                  {String(scene.chapterIndex + 1).padStart(2, '0')} ·{' '}
                  {scene.locationName}
                </span>
                <span>
                  {scene.chapterSpread + 1} / {scene.chapterSpreadCount}
                </span>
              </header>

              {scene.layout === 'contact' ? (
                <div className={classes.sceneImages} style={sceneStyle}>
                  {scene.photos.map((scenePhoto, position) =>
                    renderPhoto(scenePhoto, position, scene.layout, sceneIndex)
                  )}
                </div>
              ) : (
                <div className={classes.sceneImages}>
                  <div className={classes.leadPhoto}>
                    {renderPhoto(leadPhoto, 0, scene.layout, sceneIndex)}
                  </div>
                  <div className={classes.supportingPhotos}>
                    {supportingPhotos.map((scenePhoto, position) =>
                      renderPhoto(
                        scenePhoto,
                        position + 1,
                        scene.layout,
                        sceneIndex
                      )
                    )}
                  </div>
                </div>
              )}

              <footer className={classes.sceneMeta}>
                <span>{scene.locationName}</span>
                <span>{sceneDate}</span>
                <span>
                  {String(sceneIndex + 1).padStart(2, '0')} /{' '}
                  {String(scenes.length).padStart(2, '0')}
                </span>
              </footer>
            </motion.section>
          );
        })}
      </main>

      <aside
        className={`${classes.scrubber} ${bookVisible ? classes.scrubberVisible : ''}`}
        style={scrubberStyle}
        aria-label="Photo book timeline"
      >
        <div className={classes.scrubberCurrent} aria-live="polite">
          <span>{currentScene?.locationName}</span>
          <span>
            {String(activeScene + 1).padStart(2, '0')} /{' '}
            {String(scenes.length).padStart(2, '0')}
          </span>
        </div>

        <div className={classes.scrubberControl}>
          <span className={classes.scrubberTrack} aria-hidden="true">
            <span className={classes.scrubberProgress} />
            <span className={classes.scrubberThumb} />
          </span>
          <div className={classes.scrubberTicks} aria-hidden="true">
            {scenes.map((scene) => (
              <span key={scene.id} />
            ))}
          </div>
          <input
            className={classes.scrubberRange}
            type="range"
            min={0}
            max={Math.max(scenes.length - 1, 0)}
            value={activeScene}
            step={1}
            onChange={(event) => goToScene(Number(event.currentTarget.value))}
            aria-label="Jump to a photo book spread"
            aria-valuetext={`${currentScene?.locationName}, spread ${activeScene + 1} of ${scenes.length}`}
          />
        </div>
      </aside>

      {lightboxIndex >= 0 && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
