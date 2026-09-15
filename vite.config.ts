import react from '@vitejs/plugin-react';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { PRODUCT } from './src/config/product.ts';

const PUBLIC_PATHS = new Map([
  ['index.html', '/'], ['about/index.html', '/about/'], ['how-to-play/index.html', '/how-to-play/'],
  ['accessibility/index.html', '/accessibility/'], ['privacy/index.html', '/privacy/'],
  ['terms/index.html', '/terms/'], ['support/index.html', '/support/'], ['credits/index.html', '/credits/'],
]);

const publicMetadata = () => ({
  name: 'ripple-public-metadata',
  transformIndexHtml(html: string, context: { filename: string }) {
    const relativeName = context.filename.replaceAll('\\', '/').split('/RIPPLE/').at(-1) ?? '';
    const publicPath = PUBLIC_PATHS.get(relativeName);
    let output = html.replaceAll('RIPPLE', PRODUCT.name);
    if (PRODUCT.releaseMode === 'public' && publicPath !== undefined) {
      output = output.replace(/<meta name="robots" content="noindex, ?nofollow" ?\/>?/u, '');
      const canonical = `${PRODUCT.productionUrl.replace(/\/$/u, '')}${publicPath}`;
      output = output.replace('</head>', `<link rel="canonical" href="${canonical}"></head>`);
      if (publicPath === '/') output = output.replace('content="/marketing/harbor-hero.png"', `content="${PRODUCT.productionUrl.replace(/\/$/u, '')}/marketing/harbor-hero.png"`).replace('</head>', `<meta property="og:url" content="${canonical}"></head>`);
    }
    return output;
  },
  async closeBundle() {
    if (PRODUCT.releaseMode !== 'public') return;
    const origin = PRODUCT.productionUrl.replace(/\/$/u, '');
    const urls = [...PUBLIC_PATHS.values()].map((path) => `<url><loc>${origin}${path}</loc></url>`).join('');
    await writeFile(resolve(import.meta.dirname, 'dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`);
    await writeFile(resolve(import.meta.dirname, 'dist/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
    const headersPath = resolve(import.meta.dirname, 'dist/_headers');
    const headers = await readFile(headersPath, 'utf8');
    await writeFile(headersPath, headers.replace(/^\s*X-Robots-Tag:.*(?:\r?\n|$)/gmu, ''));
  },
});

export default defineConfig({
  define: { __RIPPLE_BUILD_ID__: JSON.stringify(process.env.RIPPLE_BUILD_ID ?? 'release') },
  plugins: [
    publicMetadata(),
    react(),
    VitePWA({
      registerType: 'prompt', injectRegister: null,
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/play/', name: `${PRODUCT.name} Harbor Puzzles`, short_name: PRODUCT.name,
        description: 'Watch a harbor delay, change the plan, and test every possible day.',
        start_url: '/play/', scope: '/', display: 'standalone',
        background_color: '#F7F8FC', theme_color: '#2952CC',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true, clientsClaim: false, skipWaiting: false,
        navigateFallback: '/play/index.html',
        navigateFallbackDenylist: [/^\/(?:about|accessibility|credits|how-to-play|privacy|support|terms)\//],
        globPatterns: ['**/*.{html,js,css,png,json,txt,webmanifest}'],
      },
    }),
  ],
  base: '/',
  build: {
    rolldownOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'), play: resolve(import.meta.dirname, 'play/index.html'),
        about: resolve(import.meta.dirname, 'about/index.html'), howToPlay: resolve(import.meta.dirname, 'how-to-play/index.html'),
        accessibility: resolve(import.meta.dirname, 'accessibility/index.html'), privacy: resolve(import.meta.dirname, 'privacy/index.html'),
        terms: resolve(import.meta.dirname, 'terms/index.html'), support: resolve(import.meta.dirname, 'support/index.html'),
        credits: resolve(import.meta.dirname, 'credits/index.html'), notFound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
});
