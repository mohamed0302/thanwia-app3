/**
 * رسائل الطالب (درجات / غياب وحضور / ملاحظات).
 * المصدر: Firebase (نظامك) أولاً، ثم Supabase، ثم تجريبي.
 */
import { fetchStudentMessagesFromFirebase } from './firebaseMessages'
import { isFirebaseConfigured } from '../../lib/firebase'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

const CACHE_KEY = 'finapp_messages'
const CACHE_MAX_AGE_MS = 2 * 60 * 1000 // دقيقتان

function getCached(studentId, studentCode) {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, at, id } = JSON.parse(raw)
    const key = studentId || studentCode
    if (id !== key || Date.now() - at > CACHE_MAX_AGE_MS) return null
    return data
  } catch {
    return null
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, at: Date.now(), id: key }))
  } catch (_) {}
}

/**
 * جلب رسائل طالب واحد.
 * studentId أو studentCode: في Firebase هو كود الطالب (نفس القيمة).
 */
export async function fetchStudentMessages(studentId) {
  if (!studentId) return []

  const cached = getCached(studentId, studentId)
  if (cached) return cached

  // 1) Firebase (نظام latest ali)
  if (isFirebaseConfigured) {
    try {
      const list = await fetchStudentMessagesFromFirebase(studentId)
      setCache(studentId, list)
      return list
    } catch (err) {
      console.error('fetchStudentMessages Firebase:', err)
      return []
    }
  }

  // 2) Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('get_student_messages', { p_student_id: studentId })
      if (!error && Array.isArray(data)) {
        setCache(studentId, data)
        return data
      }
    } catch (e) {
      console.error('fetchStudentMessages Supabase:', e)
    }
    return []
  }

  // 3) تجريبي
  const demo = [
    { id: '1', type: 'grade', content: 'امتحان الفصل الأول: 85/100', created_at: new Date().toISOString() },
    { id: '2', type: 'absence', content: 'غياب يوم ١٠/١ - مراجعة مع المدرس', created_at: new Date().toISOString() },
    { id: '3', type: 'message', content: 'إعلان: موعد الامتحان النصفي الأسبوع القادم', created_at: new Date().toISOString() },
  ]
  setCache(studentId, demo)
  return demo
}

export function groupMessagesByType(messages) {
  const grades = messages.filter((m) => m.type === 'grade')
  const absences = messages.filter((m) => m.type === 'absence')
  const announcements = messages.filter((m) => m.type === 'message')
  return { grades, absences, announcements }
}
