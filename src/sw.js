/**
 * PWA Service Worker: Workbox precaching + Firebase Cloud Messaging
 * Combines offline caching with push notifications
 */
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

// Precaching — Vite PWA injects self.__WB_MANIFEST at build time
precacheAndRoute(self.__WB_MANIFEST)

// SPA fallback: serve index.html for navigation when offline (exclude /api)
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/api/],
  })
)

// Firebase Messaging — loaded via importScripts for background messages
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyCI55J747ym_OPI5mrLyTtRxPrSCMXoD3Y',
  authDomain: 'alisystem-3a4c5.firebaseapp.com',
  databaseURL: 'https://alisystem-3a4c5-default-rtdb.firebaseio.com',
  projectId: 'alisystem-3a4c5',
  storageBucket: 'alisystem-3a4c5.firebasestorage.app',
  messagingSenderId: '799453343820',
  appId: '1:799453343820:web:5184c45fad02c74b4944e9',
})

const messaging = firebase.messaging()
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'البسيط'
  const options = { body: payload.notification?.body || '' }
  self.registration.showNotification(title, options)
})
