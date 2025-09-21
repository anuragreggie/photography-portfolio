import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importSharp() {
  try {
    const sharp = (await import('sharp')).default;
    return sharp;
  } catch (err) {
    console.error('\nMissing dependency: sharp');
    console.error('Install it with: npm i -D sharp');
    process.exit(1);
  }
}

const IMAGES_DIR = path.resolve(__dirname, '..', 'app', 'assets', 'images');
const TARGET_LONG_EDGE = 2040;

const exts = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && exts.has(path.extname(entry.name).toLowerCase())) {
      yield full;
    }
  }
}

function toMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

async function processImage(sharp, file) {
  try {
    const input = sharp(file, { failOn: 'truncated' }).rotate();
    const meta = await input.metadata();

    if (!meta.width || !meta.height) {
      console.warn('Skipping (no dimensions):', path.relative(IMAGES_DIR, file));
      return { skipped: true };
    }

    const longEdge = Math.max(meta.width, meta.height);
    const shortEdge = Math.min(meta.width, meta.height);

    const ext = path.extname(file).toLowerCase();

    // Prepare transformer: always target 2040 on long edge
    let pipeline = input.resize(TARGET_LONG_EDGE, TARGET_LONG_EDGE, {
      fit: 'inside',
      withoutEnlargement: false, // allow upscaling to exactly 2040 long edge
      fastShrinkOnLoad: true,
    }).withMetadata(); // preserve EXIF/ICC so capture date stays available

    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: '4:4:4' });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality: 90, effort: 4 });
    }

    const before = meta.size ?? 0;
    const outputBuf = await pipeline.toBuffer();
    const outMeta = await sharp(outputBuf).metadata();

    await fs.writeFile(file, outputBuf);

    const after = outputBuf.byteLength;
    const rel = path.relative(IMAGES_DIR, file);
    const outDims = outMeta.width && outMeta.height ? `${outMeta.width}x${outMeta.height}` : 'unknown';

    console.log(
      `✔ ${rel}  ${meta.width}x${meta.height} -> ${outDims}  ${toMB(before)}MB -> ${toMB(after)}MB`
    );

    if (Math.max(outMeta.width ?? 0, outMeta.height ?? 0) !== TARGET_LONG_EDGE) {
      console.warn(`  ! Warning: ${rel} long edge != ${TARGET_LONG_EDGE}`);
    }

    return { skipped: false };
  } catch (err) {
    console.error('✖ Error processing', file, err.message);
    return { skipped: true, error: err };
  }
}

async function main() {
  const sharp = await importSharp();
  console.log(`Resizing images under: ${IMAGES_DIR}`);
  let count = 0;
  let skipped = 0;
  for await (const file of walk(IMAGES_DIR)) {
    const res = await processImage(sharp, file);
    count += 1;
    if (res.skipped) skipped += 1;
  }
  console.log(`\nProcessed ${count} files. Skipped ${skipped}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
