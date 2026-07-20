import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  esbuild: {
    jsx: 'automatic',
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/')) return 'react';
            if (id.includes('react-router')) return 'router';
            if (id.includes('@aptos-labs') || id.includes('aptos')) return 'aptos';
            if (id.includes('@shelby-protocol')) return 'shelby';
            if (id.includes('@paper-design') || id.includes('three')) return 'shaders';
          }
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  publicDir: 'public',
  resolve: {
    alias: {
      buffer: resolve(__dirname, 'node_modules/buffer'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer', 'react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
