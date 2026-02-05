/**
 * طلب إذن الإشعارات وتسجيل جهاز الطالب لاستقبال الإشعارات (FCM).
 * يعمل بالكامل مع Firebase — يكتب التوكن مباشرة في Realtime Database
 */
import { ref, set } from 'firebase/database'
import { app, getDb, isFirebaseConfigured } from './firebase'
import { getVapidKey } from './config'

export async function requestAndRegisterNotifications(studentId) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (!app) return
  const vapidKey = await getVapidKey()
  if (!vapidKey) {
    console.warn('إشعارات: لم يُضبط VAPID_KEY. أضفه في config.json')
    return
  }
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return
    const reg = await navigator.serviceWorker.ready
    const { getMessaging, getToken } = await import('firebase/messaging')
    const messaging = getMessaging(app)
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: reg })
    if (!token) return
    // كتابة التوكن في Firebase مباشرة (بدون سيرفر)
    if (studentId && isFirebaseConfigured) {
      const db = getDb()
      if (db) await set(ref(db, `students/${studentId}/fcmToken`), token)
    }
  } catch (e) {
    console.warn('Notifications registration:', e)
  }
}

export async function askNotificationPermissionOnce(studentId) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'default') return
  const vapidKey = await getVapidKey()
  if (!vapidKey || !app) return
  Notification.requestPermission().then((p) => {
    if (p === 'granted') requestAndRegisterNotifications(studentId)
  })
}
