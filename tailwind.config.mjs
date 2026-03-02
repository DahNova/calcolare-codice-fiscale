/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#003087',
          green: '#1a7a4a',
          'green-hover': '#15633c',
        },
      },
    },
  },
  plugins: [],
};
