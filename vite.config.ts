import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      react(),
      sourceIdentifierPlugin({
        enabled: !isProd,
        attributePrefix: 'data-matrix',
        includeProps: true,
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
        workbox: {
          navigateFallbackDenylist: [/^\/~oauth/],
          runtimeCaching: [
            {
              // CacheFirst for static assets
              urlPattern: /\/assets\/.*/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'smart-dental-assets',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
            {
              // Never cache Supabase API calls
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
              handler: 'NetworkOnly',
            },
            {
              // NetworkFirst for everything else
              urlPattern: /^https?.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'smart-dental-pages',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
              },
            },
          ],
        },
        manifest: {
          name: 'Smart Dental Platform',
          short_name: 'SmartDental',
          description: 'Smart dental platform connect dentists, dental labs and dental suppliers together',
          theme_color: '#0D8ABC',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'favicon.ico',
              sizes: '64x64 32x32 24x24 16x16',
              type: 'image/x-icon',
            },
            {
              src: 'logo192.png',
              type: 'image/png',
              sizes: '192x192',
              purpose: 'any maskable',
            },
            {
              src: 'logo512.png',
              type: 'image/png',
              sizes: '512x512',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
