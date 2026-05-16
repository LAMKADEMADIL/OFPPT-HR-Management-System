import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(), // Tailwind 4 — remplace le plugin PostCSS
    react({
      babel: {
        plugins: [
          // React Compiler — mémoïsation automatique, plus de useMemo/useCallback manuel
          'babel-plugin-react-compiler',
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // No rewrite: Laravel's api.php is mounted at /api so the prefix must stay
      },
      '/socket.io': {
        target: 'http://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router':       ['react-router-dom'],
          'date-utils':   ['date-fns'],
          'icons':        ['lucide-react'],
        },
      },
    },
  },
});
