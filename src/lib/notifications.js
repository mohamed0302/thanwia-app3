/**
 * طلب إذن الإشعارات وتسجيل جهاز الطالب لاستقبال الإشعارات (FCM).
 * يستخدم نفس Service Worker الذي يسجّله PWA (Workbox + Firebase).
 * VAPID من config.json أو VITE_FIREBASE_VAPID_KEY
 */
import { app } from './firebase'
import { api } from './api'
import { getVapidKey } from './config'

export async function requestAndRegisterNotifications() {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (!app) return
  const vapidKey = await getVapidKey()
  if (!vapidKey) {
    console.warn('إشعارات: لم يُضبط VAPID_KEY. أضفه في config.json أو .env')
    return
  }
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return
    // انتظر Service Worker جاهز (PWA)
    const reg = await navigator.serviceWorker.ready
    const { getMessaging, getToken } = await import('firebase/messaging')
    const messaging = getMessaging(app)
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: reg })
    if (token) await api.post('/register-fcm', { token })
  } catch (e) {
    console.warn('Notifications registration:', e)
  }
}

export async function askNotificationPermissionOnce() {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'default') return
  const vapidKey = await getVapidKey()
  if (!vapidKey || !app) return
  Notification.requestPermission().then((p) => {
    if (p === 'granted') requestAndRegisterNotifications()
  })
}
