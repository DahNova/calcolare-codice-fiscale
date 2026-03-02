import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://calcolare-codice-fiscale.it',
  integrations: [
    react(),
    tailwind(),
    sitemap(),
  ],
  output: 'static',
  vite: {
    optimizeDeps: {
      include: ['react/jsx-dev-runtime'],
    },
  },
});
