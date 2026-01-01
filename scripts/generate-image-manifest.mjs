/**
 * Image Manifest Generator
 * 
 * This script pre-computes image dimensions and EXIF data at build time,
 * eliminating the need to load images at runtime just to get their dimensions.
 * 
 * Run: npm run images:manifest
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importSharp() {
  try {
    const sharp = (await import('sharp')).default;
    return sharp;
  } catch {
    console.error('\nMissing dependency: sharp');
    console.error('Install it with: npm i -D sharp');
    process.exit(1);
  }
}

async function importExifr() {
  try {
    const exifr = (await import('exifr')).default;
    return exifr;
  } catch {
    console.error('\nMissing dependency: exifr');
    console.error('Install it with: npm i exifr');
    process.exit(1);
  }
}

const IMAGES_DIR = path.resolve(__dirname, '..', 'app', 'assets', 'images');
const OUTPUT_FILE = path.resolve(__dirname, '..', 'app', 'data', 'image-manifest.json');
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Breakpoints for responsive images
const BREAKPOINTS = [400, 800, 1280, 1920];

async function* walkImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip hidden directories and non-location folders
      if (!entry.name.startsWith('.')) {
        yield* walkImages(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (EXTENSIONS.has(ext)) {
        yield fullPath;
      }
    }
  }
}

function capitalizeCountry(folder) {
  // Handle hyphenated names like "hong-kong"
  return folder
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatImageTitle(filename, country) {
  return filename
    .replace(/\.(jpg|jpeg|png|webp)$/i, '')
    .replace(/DSC0*/i, `${country} `);
}

async function processImage(sharp, exifr, filePath) {
  const relativePath = path.relative(IMAGES_DIR, filePath);
  const parts = relativePath.split(path.sep);
  
  // Skip images not in a location folder (e.g., equipment images)
  if (parts.length < 2) {
    return null;
  }
  
  const countryFolder = parts[0];
  const filename = parts[parts.length - 1];
  const country = capitalizeCountry(countryFolder);
  const relPath = `${countryFolder}/${filename}`;
  const title = formatImageTitle(filename, country);
  
  try {
    // Get image metadata using sharp
    const metadata = await sharp(filePath).metadata();
    const { width, height, orientation } = metadata;
    
    if (!width || !height) {
      console.warn(`⚠ Skipping ${relPath}: no dimensions`);
      return null;
    }
    
    // Handle orientation (some images are rotated via EXIF)
    // Orientations 5-8 swap width/height
    const isRotated = orientation && orientation >= 5 && orientation <= 8;
    const finalWidth = isRotated ? height : width;
    const finalHeight = isRotated ? width : height;
    
    // Extract EXIF date
    let dateTaken = null;
    try {
      const exif = await exifr.parse(filePath, ['DateTimeOriginal', 'CreateDate', 'ModifyDate']);
      if (exif) {
        const dateValue = exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate;
        if (dateValue) {
          dateTaken = new Date(dateValue).toISOString();
        }
      }
    } catch {
      // EXIF parsing failed, that's okay
    }
    
    // Calculate aspect ratio for responsive sizing
    const aspectRatio = finalWidth / finalHeight;
    
    // Pre-calculate dimensions for each breakpoint
    const responsiveSizes = BREAKPOINTS.map(bp => {
      const w = Math.min(bp, finalWidth); // Don't upscale
      const h = Math.round(w / aspectRatio);
      return { width: w, height: h };
    });
    
    console.log(`✓ ${relPath} (${finalWidth}x${finalHeight})`);
    
    return {
      relPath,
      country,
      countryFolder,
      filename,
      title,
      alt: title,
      width: finalWidth,
      height: finalHeight,
      aspectRatio,
      dateTaken,
      responsiveSizes,
    };
  } catch (err) {
    console.error(`✖ Error processing ${relPath}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('📸 Generating image manifest...\n');
  
  const sharp = await importSharp();
  const exifr = await importExifr();
  
  const manifest = {
    generatedAt: new Date().toISOString(),
    breakpoints: BREAKPOINTS,
    images: {},
  };
  
  let count = 0;
  let skipped = 0;
  
  for await (const filePath of walkImages(IMAGES_DIR)) {
    const imageData = await processImage(sharp, exifr, filePath);
    if (imageData) {
      manifest.images[imageData.relPath.toLowerCase()] = imageData;
      count++;
    } else {
      skipped++;
    }
  }
  
  // Write manifest
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  
  console.log(`\n✅ Manifest generated: ${OUTPUT_FILE}`);
  console.log(`   ${count} images processed, ${skipped} skipped`);
  console.log(`   File size: ${(JSON.stringify(manifest).length / 1024).toFixed(1)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
