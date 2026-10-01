import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.svg',
        'robots.txt',
      ],

      manifest: {
        name: 'LTC Pioneer Portal',

        short_name: 'LTC Portal',

        description:
          'Light Training Center Nigeria Pioneer Student Tracking & Readiness System.',

        start_url: '/',

        scope: '/',

        display: 'standalone',

        orientation: 'portrait-primary',

        theme_color: '#172554',

        background_color: '#fbfaf7',

        categories: [
          'education',
          'productivity',
        ],

        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },

          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },

          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,

        navigateFallback: '/index.html',
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
})