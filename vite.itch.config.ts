import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  define: { __RIPPLE_BUILD_ID__: JSON.stringify(process.env.RIPPLE_BUILD_ID ?? 'release') },
  plugins: [react(), VitePWA({ disable: true })],
  base: './',
  publicDir: false,
  build: {
    outDir: 'dist-itch',
    emptyOutDir: true,
    rolldownOptions: { input: resolve(import.meta.dirname, 'itch.html') },
  },
});
