/**
 * Firebase Realtime Database — ربط تطبيق الطلاب بنظامك (latest ali).
 * البنية: students/{كود_الطالب}/meta (الاسم، الصف، ...) و grades, absence, messages
 * استخدم إعدادات تطبيق الويب من Firebase Console (لا تضع service account في الويب).
 */
import { initializeApp } from 'firebase/app'
import { getDatabase, ref } from 'firebase/database'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyCI55J747ym_OPI5mrLyTtRxPrSCMXoD3Y',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'alisystem-3a4c5.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? 'https://alisystem-3a4c5-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'alisystem-3a4c5',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'alisystem-3a4c5.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '799453343820',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:799453343820:web:5184c45fad02c74b4944e9',
}

const hasConfig = config.apiKey && config.databaseURL && config.projectId

let app = null
let database = null

if (hasConfig) {
  app = initializeApp(config)
  database = getDatabase(app)
}

export const isFirebaseConfigured = Boolean(hasConfig && database)
export { app }

export function getDb() {
  return database
}

export function getStudentRef(studentCode) {
  if (!database || !studentCode) return null
  return ref(database, `students/${String(studentCode).trim()}`)
}

/** مسار فرعي تحت الطالب: meta | grades | absence | messages */
export function getStudentChildRef(studentCode, childKey) {
  if (!database || !studentCode) return null
  return ref(database, `students/${String(studentCode).trim()}/${childKey}`)
}

/** مسار فيديوهات صف معيّن (للقراءة في تطبيق الطالب) */
export function getVideosRef(grade) {
  if (!database || !grade) return null
  return ref(database, `videos/${grade}`)
}
