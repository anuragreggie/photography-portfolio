/**
 * Responsive Image Generator
 *
 * This script generates responsive image variants (400, 800, 1280, 1920 px)
 * and updates the manifest with the file paths for each size.
 *
 * Run: npm run images:optimize
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

const IMAGES_DIR = path.resolve(__dirname, '..', 'app', 'assets', 'images');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'images');
const MANIFEST_FILE = path.resolve(
  __dirname,
  '..',
  'app',
  'data',
  'image-manifest.json'
);

const BREAKPOINTS = [400, 800, 1280, 1920];
const QUALITY = 80;
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const CONCURRENCY = 8; // Process 8 images in parallel

async function* walkImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
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

async function* walkFiles(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

function toMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

async function needsRegeneration(sourcePath, outputPaths) {
  try {
    const sourceStat = await fs.stat(sourcePath);
    for (const outputPath of outputPaths) {
      try {
        const outputStat = await fs.stat(outputPath);
        // If any output is older than source, regenerate all
        if (outputStat.mtime < sourceStat.mtime) {
          return true;
        }
      } catch {
        // Output doesn't exist, needs generation
        return true;
      }
    }
    return false; // All outputs exist and are newer than source
  } catch {
    return true;
  }
}

async function processImage(sharp, filePath, existingManifest) {
  const relativePath = path.relative(IMAGES_DIR, filePath);
  const parts = relativePath.split(path.sep);

  // Skip images not in a location folder
  if (parts.length < 2) {
    return null;
  }

  const countryFolder = parts[0];
  const filename = parts[parts.length - 1];
  const baseName = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  const relPath = `${countryFolder}/${filename}`;
  const relPathLower = relPath.toLowerCase();

  // Get existing manifest entry for metadata
  const existingEntry = existingManifest?.images?.[relPathLower];
  if (!existingEntry) {
    console.warn(`⚠ No manifest entry for ${relPath}`);
    return null;
  }

  try {
    const input = sharp(filePath, { failOn: 'truncated' }).rotate();
    const meta = await input.metadata();

    if (!meta.width || !meta.height) {
      console.warn(`⚠ Skipping ${relPath}: no dimensions`);
      return null;
    }

    // Create output directory
    const outputFolder = path.join(OUTPUT_DIR, countryFolder);
    await fs.mkdir(outputFolder, { recursive: true });

    // Check if all variants already exist and are up-to-date
    const outputPaths = BREAKPOINTS.map((bp) =>
      path.join(outputFolder, `${baseName}-${bp}w.webp`)
    );

    const needsRegen = await needsRegeneration(filePath, outputPaths);
    if (!needsRegen) {
      // Load existing variant info from files
      const responsiveVariants = [];
      for (let i = 0; i < BREAKPOINTS.length; i++) {
        const breakpoint = BREAKPOINTS[i];
        const outputPath = outputPaths[i];
        const publicUrl = `/images/${countryFolder}/${baseName}-${breakpoint}w.webp`;
        try {
          const stat = await fs.stat(outputPath);
          const dimensions = await sharp(outputPath).metadata();
          responsiveVariants.push({
            width: dimensions.width,
            height: dimensions.height,
            src: publicUrl,
            size: stat.size,
          });
        } catch {
          // If we can't read existing file, fall through to regenerate
          break;
        }
      }
      if (responsiveVariants.length === BREAKPOINTS.length) {
        // Don't log skipped files to reduce noise
        return { relPath: relPathLower, responsiveVariants, skipped: true };
      }
    }

    const responsiveVariants = [];
    let totalSaved = 0;

    for (const breakpoint of BREAKPOINTS) {
      // Skip if original is smaller than breakpoint
      const targetWidth = Math.min(
        breakpoint,
        Math.max(meta.width, meta.height)
      );

      const outputFilename = `${baseName}-${breakpoint}w.webp`;
      const outputPath = path.join(outputFolder, outputFilename);
      const publicUrl = `/images/${countryFolder}/${outputFilename}`;

      // Resize maintaining aspect ratio (fit inside the breakpoint)
      const resized = await sharp(filePath)
        .rotate()
        .resize(targetWidth, targetWidth, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: QUALITY, effort: 4 })
        .toBuffer();

      await fs.writeFile(outputPath, resized);

      const resizedMeta = await sharp(resized).metadata();

      responsiveVariants.push({
        width: resizedMeta.width,
        height: resizedMeta.height,
        src: publicUrl,
        size: resized.byteLength,
      });

      totalSaved += resized.byteLength;
    }

    console.log(
      `✓ ${relPath} → ${responsiveVariants.length} variants (${toMB(totalSaved)} MB)`
    );

    return {
      relPath: relPathLower,
      responsiveVariants,
    };
  } catch (err) {
    console.error(`✖ Error processing ${relPath}:`, err.message);
    return null;
  }
}

async function removeStaleVariants(results) {
  const expectedPaths = new Set();

  for (const result of results.values()) {
    for (const variant of result.responsiveVariants) {
      const relativeOutputPath = variant.src.replace(/^\/images\//, '');
      expectedPaths.add(path.resolve(OUTPUT_DIR, relativeOutputPath));
    }
  }

  let removed = 0;

  for await (const filePath of walkFiles(OUTPUT_DIR)) {
    if (!/-\d+w\.webp$/i.test(filePath)) continue;

    const normalizedPath = path.resolve(filePath);
    if (!expectedPaths.has(normalizedPath)) {
      await fs.unlink(filePath);
      removed++;
    }
  }

  return removed;
}

async function main() {
  console.log('🖼️  Generating responsive image variants...\n');

  const sharp = await importSharp();

  // Load existing manifest
  let existingManifest = null;
  try {
    const manifestContent = await fs.readFile(MANIFEST_FILE, 'utf-8');
    existingManifest = JSON.parse(manifestContent);
  } catch {
    console.error('❌ No manifest found. Run npm run images:manifest first.');
    process.exit(1);
  }

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Collect all image paths first
  const allImages = [];
  for await (const filePath of walkImages(IMAGES_DIR)) {
    allImages.push(filePath);
  }

  console.log(
    `Found ${allImages.length} images to process (${CONCURRENCY} parallel workers)\n`
  );

  const results = new Map();
  let processedCount = 0;
  let skippedCount = 0;

  // Process images in parallel batches
  for (let i = 0; i < allImages.length; i += CONCURRENCY) {
    const batch = allImages.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map((filePath) => processImage(sharp, filePath, existingManifest))
    );

    for (const result of batchResults) {
      if (result) {
        results.set(result.relPath, result);
        if (result.skipped) {
          skippedCount++;
        } else {
          processedCount++;
        }
      }
    }
  }

  const manifestImageCount = Object.keys(existingManifest.images).length;
  if (results.size !== manifestImageCount) {
    throw new Error(
      `Only generated variants for ${results.size}/${manifestImageCount} manifest images`
    );
  }

  // Update manifest with responsive variant URLs
  let totalSize = 0;
  let totalVariants = 0;
  for (const [relPath, result] of results) {
    if (existingManifest.images[relPath]) {
      existingManifest.images[relPath].responsiveVariants =
        result.responsiveVariants.map(({ width, height, src, size }) => {
          totalSize += size ?? 0;
          totalVariants++;

          return { width, height, src };
        });
    }
  }

  const staleCount = await removeStaleVariants(results);

  // Save updated manifest
  await fs.writeFile(
    MANIFEST_FILE,
    `${JSON.stringify(existingManifest, null, 2)}\n`
  );

  console.log(
    `\n✅ Processed ${processedCount + skippedCount} images (${skippedCount} cached, ${processedCount} regenerated)`
  );
  console.log(`   Total variants: ${totalVariants}`);
  console.log(`   Removed stale variants: ${staleCount}`);
  console.log(`   Total size: ${toMB(totalSize)} MB`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log(`   Manifest updated: ${MANIFEST_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
