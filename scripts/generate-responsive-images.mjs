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
const MANIFEST_FILE = path.resolve(__dirname, '..', 'app', 'data', 'image-manifest.json');

const BREAKPOINTS = [400, 800, 1280, 1920];
const QUALITY = 80;
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

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

function toMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
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
    
    const responsiveVariants = [];
    let totalSaved = 0;
    
    for (const breakpoint of BREAKPOINTS) {
      // Skip if original is smaller than breakpoint
      const targetWidth = Math.min(breakpoint, Math.max(meta.width, meta.height));
      
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
    
    console.log(`✓ ${relPath} → ${responsiveVariants.length} variants (${toMB(totalSaved)} MB)`);
    
    return {
      relPath: relPathLower,
      responsiveVariants,
    };
  } catch (err) {
    console.error(`✖ Error processing ${relPath}:`, err.message);
    return null;
  }
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
  
  const results = new Map();
  let count = 0;
  
  for await (const filePath of walkImages(IMAGES_DIR)) {
    const result = await processImage(sharp, filePath, existingManifest);
    if (result) {
      results.set(result.relPath, result.responsiveVariants);
      count++;
    }
  }
  
  // Update manifest with responsive variant URLs
  for (const [relPath, variants] of results) {
    if (existingManifest.images[relPath]) {
      existingManifest.images[relPath].responsiveVariants = variants;
    }
  }
  
  // Save updated manifest
  existingManifest.generatedAt = new Date().toISOString();
  existingManifest.hasResponsiveVariants = true;
  await fs.writeFile(MANIFEST_FILE, JSON.stringify(existingManifest, null, 2));
  
  // Calculate total output size
  let totalSize = 0;
  for (const variants of results.values()) {
    for (const v of variants) {
      totalSize += v.size;
    }
  }
  
  console.log(`\n✅ Generated ${count * BREAKPOINTS.length} responsive images`);
  console.log(`   Total size: ${toMB(totalSize)} MB`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log(`   Manifest updated: ${MANIFEST_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
