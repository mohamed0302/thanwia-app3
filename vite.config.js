import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'البسيط',
        short_name: 'البسيط',
        theme_color: '#14b8a6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/login',
        lang: 'ar',
        dir: 'rtl',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/thanwia-app3\.vercel\.app\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-cache'
            }
          }
        ]
      }
    })
  ]
})
