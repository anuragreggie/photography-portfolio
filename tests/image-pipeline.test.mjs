import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import sharp from 'sharp';

const execute = promisify(execFile);
const repo = fileURLToPath(new URL('../', import.meta.url));

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-images-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.cp(path.join(repo, 'scripts'), path.join(root, 'scripts'), {
    recursive: true,
  });
  await fs.symlink(
    path.join(repo, 'node_modules'),
    path.join(root, 'node_modules'),
    'dir'
  );
  const images = path.join(root, 'app/assets/images/test-trip');
  const manifest = path.join(root, 'app/data/image-manifest.json');
  await fs.mkdir(images, { recursive: true });
  await fs.mkdir(path.dirname(manifest), { recursive: true });
  return {
    root,
    images,
    manifest,
    run: (script, ...args) =>
      execute(process.execPath, [path.join(root, 'scripts', script), ...args]),
  };
}

async function photo(filename, width = 100, height = 60) {
  await sharp({ create: { width, height, channels: 3, background: '#6b8e23' } })
    .jpeg()
    .toFile(filename);
}

test('manifest failure preserves the last valid manifest', async (t) => {
  const f = await fixture(t);
  const before = JSON.stringify({ images: { existing: { width: 10 } } });
  await fs.writeFile(f.manifest, before);
  await fs.writeFile(path.join(f.images, 'broken.jpg'), 'not an image');
  await assert.rejects(f.run('generate-image-manifest.mjs'));
  assert.equal(await fs.readFile(f.manifest, 'utf8'), before);
});

test('manifest regeneration preserves variants and rejects output collisions', async (t) => {
  const f = await fixture(t);
  await photo(path.join(f.images, 'photo.jpg'));
  await f.run('generate-image-manifest.mjs');
  await f.run('generate-responsive-images.mjs');
  const generated = JSON.parse(await fs.readFile(f.manifest, 'utf8'));
  const variants = generated.images['test-trip/photo.jpg'].responsiveVariants;
  assert.equal(variants.length, 4);
  for (const variant of variants) {
    const dimensions = await sharp(
      path.join(f.root, 'public', variant.src)
    ).metadata();
    assert.equal(variant.width, dimensions.width);
    assert.equal(variant.height, dimensions.height);
  }
  await f.run('generate-image-manifest.mjs');
  const regenerated = JSON.parse(await fs.readFile(f.manifest, 'utf8'));
  assert.deepEqual(regenerated, generated);
  await photo(path.join(f.images, 'photo.jpeg'));
  await assert.rejects(
    f.run('generate-image-manifest.mjs'),
    /overwrite the same variants/
  );
  assert.deepEqual(
    JSON.parse(await fs.readFile(f.manifest, 'utf8')),
    generated
  );
});

test('resizing leaves small sources unchanged and reduces oversized sources once', async (t) => {
  const f = await fixture(t);
  const small = path.join(f.images, 'small.jpg');
  const large = path.join(f.images, 'large.jpg');
  await photo(small);
  await photo(large, 2400, 1600);
  const original = await fs.readFile(small);
  await f.run('resize-images.mjs', 'test-trip');
  assert.deepEqual(await fs.readFile(small), original);
  const resized = await fs.readFile(large);
  const metadata = await sharp(resized).metadata();
  assert.equal(metadata.width, 2040);
  assert.equal(metadata.height, 1360);
  await f.run('resize-images.mjs', 'test-trip');
  assert.deepEqual(await fs.readFile(large), resized);
});

test('optimizer failure preserves the manifest and does not delete existing variants', async (t) => {
  const f = await fixture(t);
  const source = path.join(f.images, 'photo.jpg');
  await photo(source);
  await f.run('generate-image-manifest.mjs');
  await f.run('generate-responsive-images.mjs');
  const before = await fs.readFile(f.manifest, 'utf8');
  const retained = path.join(f.root, 'public/images/test-trip/old-400w.webp');
  await fs.writeFile(retained, 'existing output');
  await fs.writeFile(source, 'broken image');
  await assert.rejects(f.run('generate-responsive-images.mjs'));
  assert.equal(await fs.readFile(f.manifest, 'utf8'), before);
  assert.equal(await fs.readFile(retained, 'utf8'), 'existing output');
});
