import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { lastmodFor } from './src/lib/lastmod.ts';

// Date dell'ultimo commit per file sorgente, generate da `npm run lastmod`
// e committate. Non si chiama git qui: su Vercel il clone e' shallow.
const sourceDates = JSON.parse(readFileSync('./src/data/source-dates.json', 'utf8'));

export default defineConfig({
  site: 'https://www.calcolare-codice-fiscale.it',
  trailingSlash: 'always',
  integrations: [
    react(),
    tailwind(),
    sitemap({
      serialize(item) {
        // Nessun lastmod inventato: se la rotta non ha una data nota,
        // la voce resta con il solo <loc>.
        const lastmod = lastmodFor(item.url, sourceDates);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
  output: 'static',
  vite: {
    optimizeDeps: {
      include: ['react/jsx-dev-runtime'],
    },
  },
});
