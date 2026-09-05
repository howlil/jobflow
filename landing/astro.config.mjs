import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    build: {
      rolldownOptions: {
        tsconfig: './tsconfig.json',
      },
    },
  },
});
