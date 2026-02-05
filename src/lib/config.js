/**
 * تحميل الإعدادات من config.json عند التشغيل
 * يسمح بتغيير عنوان الـ API ومفتاح الإشعارات دون إعادة بناء التطبيق
 */
let cached = null

export async function getConfig() {
  if (cached) return cached
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const res = await fetch(`${base}/config.json?t=${Date.now()}`)
    if (res.ok) cached = await res.json()
    else cached = {}
  } catch {
    cached = {}
  }
  return cached
}

export async function getApiBase() {
  const c = await getConfig()
  return c.apiUrl || import.meta.env.VITE_API_URL || '/api'
}

export async function getVapidKey() {
  const c = await getConfig()
  return c.firebaseVapidKey || import.meta.env.VITE_FIREBASE_VAPID_KEY || ''
}
