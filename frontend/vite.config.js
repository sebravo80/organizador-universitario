import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Instalar: npm install vite-plugin-pwa

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'diatoicon.png', 'robots.txt'],
      manifest: {
        name: 'Organizador Universitario',
        short_name: 'OrgaUniv',
        description: 'Organizador para estudiantes universitarios',
        theme_color: '#72002a',
        background_color: '#ffffff',
        icons: [
          {
            src: 'diatoicon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'diatoicon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173, 
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    chunkSizeWarningLimit: 1600
  }
});