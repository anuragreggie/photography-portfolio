import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../', import.meta.url));
const manifestPath = path.join(repo, 'app/data/image-manifest.json');
const homeRoutePath = path.join(repo, 'app/routes/home/route.tsx');
const galleryRoutePath = path.join(repo, 'app/routes/gallery/route.tsx');

const NEW_ITALY_FILES = [
  '20260828-DSC02262.jpg',
  '20260828-DSC02373.jpg',
  '20260828-DSC02384.jpg',
  '20260828-DSC02394.jpg',
  '20260828-DSC02436.jpg',
  '20260828-DSC02498.jpg',
  '20260828-DSC02503.jpg',
  '20260829-DSC02579.jpg',
  '20260829-DSC02589.jpg',
  '20260829-DSC02866.jpg',
  '20260829-DSC02923.jpg',
  '20260830-DSC02974.jpg',
  '20260830-DSC03236.jpg',
];

test('latest Italy photos live in their own folder with variants on disk', async () => {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const latestEntries = Object.entries(manifest.images).filter(([key]) =>
    key.startsWith('italy-2026/')
  );
  const originalEntries = Object.entries(manifest.images).filter(([key]) =>
    key.startsWith('italy/')
  );

  assert.equal(latestEntries.length, 13);
  assert.equal(originalEntries.length, 0);

  for (const filename of NEW_ITALY_FILES) {
    const key = `italy-2026/${filename.toLowerCase()}`;
    const entry = manifest.images[key];
    assert.ok(entry, `missing manifest entry for ${key}`);
    assert.equal(entry.responsiveVariants.length, 4);
    for (const variant of entry.responsiveVariants) {
      const onDisk = path.join(repo, 'public', variant.src.replace(/^\//, ''));
      const stat = await fs.stat(onDisk);
      assert.ok(stat.size > 0, `${variant.src} is empty`);
    }
  }

  const sorted = latestEntries
    .map(([, entry]) => entry)
    .sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken));
  assert.equal(sorted[0].relPath, 'italy-2026/20260830-DSC03236.jpg');
});

test('home page has no Italy section and gallery uses the shared book', async () => {
  const homeSource = await fs.readFile(homeRoutePath, 'utf8');
  assert.doesNotMatch(homeSource, /Latest from Italy/);

  const gallerySource = await fs.readFile(galleryRoutePath, 'utf8');
  assert.match(gallerySource, /createAllPhotos/);
  assert.match(gallerySource, /orderPhotosByTrip/);
});

test('italy-2026 chapter heroes lead with 2503 and keep the church', async () => {
  const gallerySource = await fs.readFile(galleryRoutePath, 'utf8');
  assert.match(
    gallerySource,
    /'italy-2026':\s*\['20260828-DSC02503',\s*'20260830-DSC03236'\]/
  );

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  for (const key of [
    'italy-2026/20260828-dsc02503.jpg',
    'italy-2026/20260830-dsc03236.jpg',
  ]) {
    const entry = manifest.images[key];
    assert.ok(entry, `missing manifest entry for ${key}`);
    assert.ok(entry.width > entry.height, `${key} must be landscape`);
  }
});

test('main entry gallery swaps Big Ben for the Petronas Towers', async () => {
  const homeSource = await fs.readFile(homeRoutePath, 'utf8');
  assert.match(homeSource, /malaysia\/20260615-DSC00873\.jpg/);
  assert.doesNotMatch(homeSource, /uk\/DSC07626\.jpg/);

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const entry = manifest.images['malaysia/20260615-dsc00873.jpg'];
  assert.ok(entry, 'missing manifest entry for the Petronas photo');
  assert.equal(entry.responsiveVariants.length, 4);
});

test('main entry gallery swaps Shinkansen for the Dolomites church', async () => {
  const homeSource = await fs.readFile(homeRoutePath, 'utf8');
  assert.match(homeSource, /italy-2026\/20260830-DSC03236\.jpg/);
  assert.doesNotMatch(homeSource, /shinkansen-driver-v2/);

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const entry = manifest.images['italy-2026/20260830-dsc03236.jpg'];
  assert.ok(entry, 'missing manifest entry for the church photo');
  assert.equal(entry.responsiveVariants.length, 4);
});

test('dev command uses polling watcher so it does not crash with EMFILE', async () => {
  const pkg = JSON.parse(
    await fs.readFile(path.join(repo, 'package.json'), 'utf8')
  );
  assert.match(pkg.scripts.dev, /CHOKIDAR_USEPOLLING/);
  assert.match(pkg.scripts.dev, /react-router dev/);
});
