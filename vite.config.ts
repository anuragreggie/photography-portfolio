import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    cssCodeSplit: false,
  },
  server: {
    watch: {
      // Static originals and generated variants are served, not compiled.
      // Watching them exhausts FSEvents descriptors in dev (EMFILE), so poll.
      ignored: ['**/public/**', '**/app/assets/**'],
      usePolling: true,
      interval: 300,
    },
  },
});
