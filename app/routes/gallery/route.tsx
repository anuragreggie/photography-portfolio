import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
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

type AlbumPhoto = PortfolioPhoto & {
  portfolioIndex: number;
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
  '--progress'?: string;
};

const MAX_PHOTOS_PER_SPREAD = 10;

// A strong opening frame for each chapter. These are intentionally curated
// rather than inferred from orientation or filename order.
const CHAPTER_HEROES: Record<string, string> = {
  'hong-kong': 'DSC05768',
  italy: 'DSC01844',
  japan: 'DSC02897',
  norway: 'DSC03947',
  switzerland: 'DSC06387',
  uk: 'DSC04453',
  'united-states': 'DSC08701',
};

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

function photoName(photo: PortfolioPhoto) {
  return (
    photo.src
      .split('/')
      .at(-1)
      ?.replace(/-\d+w\.webp$/i, '') ?? ''
  );
}

function promoteChapterHero(photos: ScenePhoto[], locationFolder: string) {
  const preferredName = CHAPTER_HEROES[locationFolder];
  const heroIndex = photos.findIndex(
    ({ photo }) => photoName(photo) === preferredName
  );

  if (heroIndex <= 0) return photos;

  return [
    photos[heroIndex],
    ...photos.slice(0, heroIndex),
    ...photos.slice(heroIndex + 1),
  ];
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
      const curatedPhotos = promoteChapterHero(tripPhotos, locationFolder);
      const counts = spreadCounts(curatedPhotos.length);
      let photoIndex = 0;

      return counts.map((count, chapterSpread) => {
        const spreadPhotos = curatedPhotos.slice(
          photoIndex,
          photoIndex + count
        );
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
            layout === 'contact' || chapterSpread === 0
              ? spreadPhotos
              : selectAnchor(spreadPhotos),
        };
      });
    }
  );
}

function formatDate(date?: Date) {
  if (!date || Number.isNaN(date.getTime())) return 'June 2025';
  return DATE_FORMATTER.format(date);
}

function toAlbumPhoto({ photo, index }: ScenePhoto): AlbumPhoto {
  return { ...photo, portfolioIndex: index };
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

  function renderHero({ photo, index }: ScenePhoto, sceneIndex: number) {
    return (
      <motion.button
        key={photo.src}
        type="button"
        className={classes.heroShot}
        onClick={() => setLightboxIndex(index)}
        aria-label={`Open photograph ${index + 1} of ${photos.length}`}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.55,
        }}
      >
        <img
          src={photo.src}
          srcSet={photo.srcSet
            ?.map((image) => `${image.src} ${image.width}w`)
            .join(', ')}
          sizes="(max-width: 700px) 100vw, 1240px"
          alt={photo.alt || ''}
          className={classes.heroPhoto}
          loading={sceneIndex < 2 ? 'eager' : 'lazy'}
          fetchPriority={sceneIndex === 0 ? 'high' : 'auto'}
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
          const leadPhoto = scene.photos[0];
          const hasHero = scene.chapterSpread === 0 && scene.photos.length > 2;
          const albumPhotos = (
            hasHero ? scene.photos.slice(1) : scene.photos
          ).map(toAlbumPhoto);
          const portraitOnlyRow = albumPhotos.every(
            (photo) => photo.height / photo.width > 1.15
          );
          const sparsePortraitRow =
            portraitOnlyRow && albumPhotos.length <= 2;
          const albumMaxWidth = portraitOnlyRow ? 800 : 1080;
          const leadIsPortrait =
            leadPhoto.photo.height / leadPhoto.photo.width > 1.15;

          return (
            <motion.section
              key={scene.id}
              id={scene.id}
              ref={(element) => {
                sceneRefs.current[sceneIndex] = element;
              }}
              data-index={sceneIndex}
              className={`${classes.scene} ${classes[scene.layout]} ${leadIsPortrait ? classes.leadPortrait : ''}`}
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

              <div className={classes.sceneImages}>
                {hasHero && (
                  <div className={classes.heroPanel}>
                    {renderHero(leadPhoto, sceneIndex)}
                  </div>
                )}

                {albumPhotos.length > 0 && (
                  <RowsPhotoAlbum
                    photos={albumPhotos}
                    spacing={(containerWidth) => (containerWidth < 700 ? 5 : 9)}
                    targetRowHeight={(containerWidth) =>
                      sparsePortraitRow
                        ? containerWidth < 700
                          ? 260
                          : 390
                        : portraitOnlyRow
                        ? containerWidth < 700
                          ? 170
                          : 220
                        : containerWidth < 500
                          ? 165
                          : containerWidth < 900
                            ? 220
                            : scene.layout === 'film'
                              ? 290
                              : 255
                    }
                    rowConstraints={(containerWidth) => ({
                      minPhotos: 1,
                      maxPhotos: containerWidth < 700 ? 4 : 5,
                      singleRowMaxHeight: sparsePortraitRow
                        ? containerWidth < 700
                          ? 300
                          : 420
                        : undefined,
                    })}
                    sizes={{
                      size: `${albumMaxWidth}px`,
                      sizes: [
                        {
                          viewport: '(max-width: 1340px)',
                          size: `min(calc(100vw - 120px), ${albumMaxWidth}px)`,
                        },
                        {
                          viewport: '(max-width: 700px)',
                          size: 'calc(100vw - 24px)',
                        },
                      ],
                    }}
                    defaultContainerWidth={albumMaxWidth}
                    onClick={({ photo }) =>
                      setLightboxIndex(photo.portfolioIndex)
                    }
                    componentsProps={{
                      container: {
                        className: `${classes.album} ${
                          portraitOnlyRow
                            ? classes.portraitAlbum
                            : classes.mixedAlbum
                        }`,
                      },
                      button: { className: classes.albumButton },
                      image: {
                        className: classes.albumPhoto,
                        loading: sceneIndex < 2 ? 'eager' : 'lazy',
                        decoding: 'async',
                      },
                    }}
                  />
                )}
              </div>

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
