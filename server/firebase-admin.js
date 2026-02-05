/**
 * Firebase Admin — للتحكم من السيرفر (إضافة فيديوهات، حذف رسائل).
 * ضع ملف serviceAccountKey.json في مجلد server أو حدد المسار في FIREBASE_SERVICE_ACCOUNT_PATH
 */
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEFAULT_KEY_PATH = join(__dirname, 'serviceAccountKey.json')
const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://alisystem-3a4c5-default-rtdb.firebaseio.com'

let db = null
let messaging = null
let tried = false

async function initFirebase() {
  if (db) return db
  if (tried) return null
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || DEFAULT_KEY_PATH
  if (!existsSync(keyPath)) {
    tried = true
    console.warn('Firebase Admin: serviceAccountKey.json not found in server folder. Copy from latest ali. Admin APIs will not work.')
    return null
  }
  tried = true
  try {
    const firebaseAdmin = (await import('firebase-admin')).default
    if (!firebaseAdmin.apps?.length) {
      const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'))
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
        databaseURL: DATABASE_URL,
      })
    }
    db = firebaseAdmin.database()
    try {
      messaging = firebaseAdmin.messaging()
    } catch (_) {}
    return db
  } catch (e) {
    console.error('Firebase Admin init error:', e)
    return null
  }
}

export function getFirebaseDb() {
  return db
}

export function getMessaging() {
  return messaging
}

export async function ensureFirebase() {
  if (db) return db
  return initFirebase()
}
