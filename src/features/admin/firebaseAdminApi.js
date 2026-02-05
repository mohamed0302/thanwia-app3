/**
 * عمليات الإدارة مباشرة من Firebase — بدون سيرفر
 * يتطلب أن يكون المستخدم مسجّل دخوله بـ Firebase Auth ومسجّل في /admins
 */
import { get, set, push, remove } from 'firebase/database'
import { getDb, getVideosRef, getExamsRef, getStudentChildRef } from '../../lib/firebase'

/** فيديوهات */
export async function fetchVideos(grade) {
  const ref = getVideosRef(grade)
  if (!ref) return []
  const snap = await get(ref)
  const val = snap.val()
  if (!val || typeof val !== 'object') return []
  return Object.entries(val).map(([id, v]) => ({ id, ...v, grade }))
}

export async function addVideo(grade, { title, video_url, subject }) {
  const ref = getVideosRef(grade)
  if (!ref) throw new Error('غير متاح')
  const newRef = push(ref)
  await set(newRef, { title: title || '', video_url: video_url || '', subject: subject || '', createdAt: new Date().toISOString() })
  return { id: newRef.key, title, video_url, subject, grade }
}

export async function deleteVideo(grade, id) {
  const db = getDb()
  if (!db) throw new Error('غير متاح')
  const { ref } = await import('firebase/database')
  const videoRef = ref(db, `videos/${grade}/${id}`)
  await remove(videoRef)
}

/** امتحانات */
export async function fetchExams(grade) {
  const ref = getExamsRef(grade)
  if (!ref) return []
  const snap = await get(ref)
  const val = snap.val()
  if (!val || typeof val !== 'object') return []
  return Object.entries(val).map(([id, v]) => ({ id, ...v, grade }))
}

export async function addExam(grade, { title, url }) {
  const ref = getExamsRef(grade)
  if (!ref) throw new Error('غير متاح')
  const newRef = push(ref)
  await set(newRef, { title: title || '', url: url || '', createdAt: new Date().toISOString() })
  return { id: newRef.key, title, url, grade }
}

export async function deleteExam(grade, id) {
  const db = getDb()
  if (!db) throw new Error('غير متاح')
  const { ref } = await import('firebase/database')
  const examRef = ref(db, `exams/${grade}/${id}`)
  await remove(examRef)
}

/** رسائل الطالب */
export async function fetchStudentMessages(studentCode) {
  const db = getDb()
  if (!db) throw new Error('غير متاح')
  const { ref } = await import('firebase/database')
  const base = `students/${String(studentCode).trim()}`
  const [gradesSnap, absenceSnap, messagesSnap] = await Promise.all([
    get(ref(db, `${base}/grades`)),
    get(ref(db, `${base}/absence`)),
    get(ref(db, `${base}/messages`)),
  ])
  const toList = (snap, type) => {
    const val = snap.val()
    if (!val || typeof val !== 'object') return []
    return Object.entries(val).map(([id, v]) => ({ id, type, text: v.text || v.content || '', timestamp: v.timestamp }))
  }
  const grades = toList(gradesSnap, 'grade')
  const absence = toList(absenceSnap, 'absence')
  const messages = toList(messagesSnap, 'message')
  return { grades, absence, messages }
}

export async function addMessage(studentCode, type, text) {
  const pathMap = { grade: 'grades', absence: 'absence', message: 'messages' }
  const path = pathMap[type]
  if (!path || !studentCode || !text) throw new Error('كود الطالب ونوع الرسالة والنص مطلوبان')
  const childRef = getStudentChildRef(studentCode, path)
  if (!childRef) throw new Error('غير متاح')
  const newRef = push(childRef)
  const data = { text: text.trim(), content: text.trim(), timestamp: new Date().toISOString() }
  await set(newRef, data)
  return newRef.key
}

export async function deleteMessage(studentCode, type, messageId) {
  const pathMap = { grade: 'grades', absence: 'absence', message: 'messages' }
  const path = pathMap[type]
  if (!path) throw new Error('نوع غير صحيح')
  const db = getDb()
  if (!db) throw new Error('غير متاح')
  const { ref } = await import('firebase/database')
  const msgRef = ref(db, `students/${studentCode}/${path}/${messageId}`)
  await remove(msgRef)
}
