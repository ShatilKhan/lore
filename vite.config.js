import { resolve } from 'path';
import { defineConfig } from 'vite';

// Repo-name base for GitHub Pages (served at /<repo>/).
// Override locally with `vite build` (defaults to GH Pages base) or
// `BASE=/ vite build` for a root deploy.
const base = process.env.BASE ?? '/lore/';

export default defineConfig({
  root: 'src',
  base,
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        nna: resolve(__dirname, 'src/nna/index.html'),
      },
    },
  },
  server: { open: '/index.html' },
});
