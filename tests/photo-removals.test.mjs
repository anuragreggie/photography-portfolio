import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../', import.meta.url));
const manifestPath = path.join(repo, 'app/data/image-manifest.json');

async function assertRemoved(folder, filename) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const key = `${folder}/${filename.toLowerCase()}`;
  assert.equal(
    manifest.images[key],
    undefined,
    `${key} should not be manifested`
  );
  for (const width of [400, 800, 1280, 1920]) {
    const variant = path.join(
      repo,
      `public/images/${folder}`,
      `${filename.replace(/\.(jpg|jpeg|png|webp)$/i, '')}-${width}w.webp`
    );
    await assert.rejects(fs.stat(variant), `${variant} should not exist`);
  }
  await assert.rejects(
    fs.stat(path.join(repo, `app/assets/images/${folder}`, filename)),
    `${filename} original should not exist`
  );
}

async function remainingCount(folder) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  return Object.keys(manifest.images).filter((key) =>
    key.startsWith(`${folder}/`)
  ).length;
}

test('removed Copenhagen photos are gone from manifest and disk', async () => {
  for (const filename of [
    'DSCF9391.jpg',
    'DSCF9472.jpg',
    '20260329-DSC09725.jpg',
  ]) {
    await assertRemoved('copenhagen', filename);
  }

  assert.equal(await remainingCount('copenhagen'), 6);
});

test('removed Shard photo is gone from manifest and disk', async () => {
  await assertRemoved('uk', 'DSC07120.jpg');

  assert.equal(await remainingCount('uk'), 8);
});
