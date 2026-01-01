# Photography Portfolio - Image Management Guide

## Adding New Images

When you add new photos to your portfolio, follow these steps:

### 1. Add your image files

Place your images in the appropriate location folder:

```
app/assets/images/
├── france/
├── hong-kong/
├── italy/
├── japan/
├── norway/
├── switzerland/
└── uk/
```

**Image requirements:**
- Format: JPG, JPEG, PNG, or WebP
- Recommended: Pre-resize to 2040px on the long edge (use `npm run images:resize`)
- Keep original EXIF data for date sorting

### 2. Resize images (optional but recommended)

If your images are larger than 2040px, resize them:

```bash
npm run images:resize
```

This resizes all images to 2040px on the long edge while preserving EXIF data.

### 3. Generate the image manifest

This creates `app/data/image-manifest.json` with pre-computed dimensions:

```bash
npm run images:manifest
```

**What this does:**
- Scans all images in `app/assets/images/*/`
- Extracts width, height, aspect ratio
- Extracts EXIF date for sorting
- Stores everything in a JSON file so the browser doesn't need to calculate dimensions at runtime

### 4. Generate responsive variants

This creates optimized WebP images at multiple sizes:

```bash
npm run images:optimize
```

**What this creates:**
- `public/images/{location}/{filename}-400w.webp` (mobile)
- `public/images/{location}/{filename}-800w.webp` (tablet)
- `public/images/{location}/{filename}-1280w.webp` (laptop)
- `public/images/{location}/{filename}-1920w.webp` (desktop)

### 5. Build and deploy

```bash
npm run build
```

The build automatically runs `images:manifest` first.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run images:resize` | Resize source images to 2040px |
| `npm run images:manifest` | Generate dimension metadata |
| `npm run images:optimize` | Generate responsive WebP variants |
| `npm run build` | Production build (runs manifest first) |
| `npm run build:full` | Full build with all image processing |

---

## Adding a New Location

1. Create a new folder in `app/assets/images/`:
   ```
   app/assets/images/new-location/
   ```

2. Add your images to the folder

3. Update `app/data/locations.ts`:
   ```typescript
   import newLocationHero from '../assets/images/new-location/hero-image.jpg?format=webp&w=800&quality=80';

   export const locations: Location[] = [
     // ... existing locations
     { 
       name: 'New Location', 
       folder: 'new-location',
       heroImage: newLocationHero
     },
   ];
   ```

4. Run the image processing:
   ```bash
   npm run images:manifest
   npm run images:optimize
   ```

---

## How It Works

### Why pre-compute dimensions?

Without pre-computed dimensions, the browser would need to:
1. Download each image
2. Create a hidden `<img>` element
3. Wait for it to load
4. Read `naturalWidth` and `naturalHeight`

This causes a 2-5 second delay before the gallery can render.

With the manifest, dimensions are known **instantly** from the JSON file.

### Why responsive images?

| Device | Image Width | Typical File Size |
|--------|-------------|-------------------|
| Mobile | 400px | ~25KB |
| Tablet | 800px | ~80KB |
| Laptop | 1280px | ~175KB |
| Desktop | 1920px | ~330KB |

Mobile users download **12x less data** than before!

### Why self-hosted fonts?

Google Fonts requires an external HTTP request that blocks rendering. Self-hosting eliminates this ~200-500ms delay.

---

## Troubleshooting

### Images not appearing
1. Check the image is in `app/assets/images/{location}/`
2. Run `npm run images:manifest` to update the manifest
3. Run `npm run images:optimize` to generate WebP variants

### Gallery showing wrong dimensions
The manifest might be stale. Regenerate it:
```bash
npm run images:manifest
```

### Build fails
Make sure Sharp is installed:
```bash
npm install
```

---

## File Structure

```
photography-portfolio/
├── app/
│   ├── assets/images/          # Source images (JPG/PNG)
│   │   ├── japan/
│   │   ├── france/
│   │   └── ...
│   ├── data/
│   │   ├── image-manifest.json # Pre-computed dimensions (generated)
│   │   ├── locations.ts        # Location configuration
│   │   └── photos.ts           # Photo loading logic
│   └── fonts.css               # Self-hosted font definitions
├── public/
│   ├── fonts/                  # Self-hosted Lora font files
│   └── images/                 # Responsive WebP variants (generated)
│       ├── japan/
│       │   ├── photo-400w.webp
│       │   ├── photo-800w.webp
│       │   ├── photo-1280w.webp
│       │   └── photo-1920w.webp
│       └── ...
└── scripts/
    ├── generate-image-manifest.mjs   # Dimension extraction
    ├── generate-responsive-images.mjs # WebP variant generation
    └── resize-images.mjs             # Source image resizing
```
