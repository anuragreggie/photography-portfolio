import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const viteConfig = await fs.readFile(
  new URL('../vite.config.ts', import.meta.url),
  'utf8'
);

test('vite dedupes react so Router hooks share one React copy', () => {
  assert.match(viteConfig, /dedupe/);
  assert.match(viteConfig, /['"]react['"]/);
  assert.match(viteConfig, /['"]react-dom['"]/);
});
