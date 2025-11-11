import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    reactRouter(),
    imagetools(),
  ],
  build: {
    cssCodeSplit: false,
  },
});
