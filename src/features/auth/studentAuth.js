/**
 * تسجيل دخول الطالب: Firebase (نظامك) أولاً، ثم Supabase، ثم تجريبي.
 * لا كتابة على قاعدة البيانات؛ جلب بيانات الطالب بالكود فقط.
 */
import { fetchStudentByCodeFromFirebase } from './firebaseStudentAuth'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { isFirebaseConfigured } from '../../lib/firebase'
import { normalizeStudentCode } from './constants'

export async function fetchStudentByCode(code) {
  const normalized = normalizeStudentCode(code)
  if (!normalized) {
    throw new Error('أدخل كود الطالب')
  }

  // 1) نظامك: Firebase Realtime Database (latest ali)
  if (isFirebaseConfigured) {
    try {
      const student = await fetchStudentByCodeFromFirebase(code)
      return student
    } catch (err) {
      if (err.message && err.message.includes('كود الطالب غير صحيح')) throw err
      console.error('Firebase student fetch:', err)
      throw new Error('تعذر التحقق من كود الطالب. تحقق من الاتصال.')
    }
  }

  // 2) Supabase إن وُجد
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('students')
      .select('id, student_code, name, grade, phone')
      .eq('student_code', normalized)
      .maybeSingle()
    if (!error && data) {
      return {
        id: data.id,
        student_code: data.student_code,
        name: data.name ?? '',
        grade: data.grade ?? '',
        phone: data.phone ?? null,
      }
    }
    if (error) console.error('Supabase student fetch:', error)
    throw new Error('كود الطالب غير صحيح')
  }

  // 3) تجريبي بدون خادم
  if (normalized === 'STU001' || normalized === 'demo') {
    return {
      id: 'demo-student',
      student_code: normalized,
      name: 'طالب تجريبي',
      grade: '1st_secondary',
      phone: null,
    }
  }

  throw new Error('الخادم غير متاح. جرّب كود: STU001 أو الدخول كزائر.')
}

/** بناء الجلسة للتخزين في localStorage */
export function buildStudentSession(student) {
  const user = {
    id: student.id,
    student_code: student.student_code,
    name: student.name,
    grade: student.grade,
    phone: student.phone ?? null,
    role: 'student',
  }
  const token = `student-${student.id}`
  return { user, token }
}
