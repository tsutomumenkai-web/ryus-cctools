import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'src/index.js'),
      treeshake: false, // Ensures your global variable mappings are never dropped
      output: {
        entryFileNames: 'main.js',
        format: 'iife', // Safe, flat functional injection script
        name: 'RyuCCToolsBundle'
      }
    },
    sourcemap: true,
    minify: false
  }
});