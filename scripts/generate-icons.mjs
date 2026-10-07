import fs from 'node:fs/promises';
import sharp from 'sharp';

const source = new URL(
  '../app/assets/icons/tab-portrait.webp',
  import.meta.url
);
const publicDir = new URL('../public/', import.meta.url);
const sizes = [16, 32, 48];
const input = await fs.readFile(source);
const frames = await Promise.all(
  sizes.map((size) =>
    sharp(input).resize(size, size, { fit: 'cover' }).png().toBuffer()
  )
);

// ICO directory entries point to PNG frames for each tab/display resolution.
const directory = Buffer.alloc(6 + 16 * frames.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(frames.length, 4);
let offset = directory.length;
frames.forEach((frame, index) => {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await fs.writeFile(
  new URL('favicon.ico', publicDir),
  Buffer.concat([directory, ...frames])
);
await sharp(input)
  .resize(180, 180, { fit: 'cover' })
  .png()
  .toFile(new URL('apple-touch-portrait.png', publicDir).pathname);
