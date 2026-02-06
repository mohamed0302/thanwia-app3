import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: true,
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
