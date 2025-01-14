import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills()
  ],
  build: {
    rollupOptions: {
      external: ['react-router-dom'],
      output: {
        globals: {
          'react-router-dom': 'ReactRouterDOM'
        }
      }
    }
  },
  base: '/',
});