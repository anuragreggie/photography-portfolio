# Image management

## Add photographs

1. Put JPG, JPEG, PNG, or WebP files in `app/assets/images/{location}/`. Keep EXIF capture dates for chronological sorting. Equipment images live directly under `app/assets/images` and are excluded from the gallery.
2. Optionally reduce oversized sources with `npm run images:resize -- japan` (substitute the location folder). This **overwrites source files**: keep your originals elsewhere. It preserves metadata, limits the long edge to 2040px, and leaves already-small images unchanged. Omitting the folder scans all source images.
3. Run `npm run build` to regenerate metadata and responsive variants, then build the site.
4. Review and commit the source photos, `app/data/image-manifest.json`, and generated files under `public/images` together.

Each photo needs a unique filename stem within its location: `photo.jpg` and `photo.png` would otherwise overwrite the same WebP outputs. Manifest generation rejects such collisions and fails on unreadable gallery images before replacing the previous manifest.

## Add a location

Create its folder under `app/assets/images`, then add its display name and folder to the sorted list in `app/data/locations.ts`. The gallery groups photos by location and sorts trips by capture date. Missing dates are displayed as unavailable.

Optional featured-photo preferences are in `CHAPTER_HEROES` in `app/routes/gallery/route.tsx`. The home-page selection is in `fixedImagePaths` in `app/routes/home/route.tsx`.

## Commands

- `npm run images:resize -- japan`: reduce oversized source photographs in one location.
- `npm run images:manifest`: extract dimensions and EXIF metadata; preserve existing responsive variants when dimensions match.
- `npm run images:optimize`: generate responsive WebP variants and remove obsolete variants after successful processing.
- `npm run build`: run both generation steps and build the app.
- `npm run build:quick`: build with existing generated images and metadata.
- `npm run icons:generate`: regenerate the portrait favicon and Apple touch icon.

When adding photos or changing dimensions, run both manifest generation and optimization before opening the app. New photos cannot render until their responsive variants exist.

## Responsive variants

Generated files use the suffixes `-400w.webp`, `-800w.webp`, `-1280w.webp`, and `-1920w.webp`. These numbers describe the **maximum long edge**, not necessarily the actual width. Portrait images have narrower widths; small sources are never enlarged. The manifest records actual output dimensions for browser `srcset` selection.

The optimizer reuses variants newer than their source. If you change encoding settings, remove the affected generated variants and run optimization to regenerate them.

## Troubleshooting

For missing photos or incorrect dimensions, run `npm run images:manifest` followed by `npm run images:optimize`, and check for reported errors. Preserve source EXIF metadata when exporting photos if dates matter. Run `npm run check` and a full build before deployment.
