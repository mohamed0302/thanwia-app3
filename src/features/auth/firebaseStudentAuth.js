/**
 * تسجيل دخول الطالب من Firebase Realtime Database (نظام latest ali).
 * البنية: students/{كود_الطالب}/meta → الاسم، الصف، المجموعة، الهاتف، البريد
 */
import { get } from 'firebase/database'
import { isFirebaseConfigured, getStudentRef } from '../../lib/firebase'
import { normalizeStudentCode } from './constants'

/** تحويل الصف من النظام (عربي) إلى قيمة للتطبيق */
function normalizeGrade(صف) {
  if (!صف || typeof صف !== 'string') return '1st_secondary'
  const s = صف.trim()
  if (/الثالث|ثالث|3/.test(s)) return '3rd_secondary'
  if (/الثاني|ثاني|2/.test(s)) return '2nd_secondary'
  if (/الأول|اول|1/.test(s)) return '1st_secondary'
  return '1st_secondary'
}

/**
 * جلب بيانات طالب من Firebase بالكود فقط.
 * المسار: students/{code} ثم قراءة meta (الاسم، الصف، المجموعة، الهاتف).
 */
export async function fetchStudentByCodeFromFirebase(code) {
  const normalized = normalizeStudentCode(code)
  if (!normalized) {
    throw new Error('أدخل كود الطالب')
  }

  if (!isFirebaseConfigured) {
    throw new Error('Firebase غير مضبوط. تحقق من ملف .env')
  }

  const studentRef = getStudentRef(normalized)
  if (!studentRef) throw new Error('كود الطالب غير صحيح')

  const snapshot = await get(studentRef)
  const data = snapshot.val()

  if (!data || !data.meta) {
    throw new Error('كود الطالب غير صحيح')
  }

  const meta = data.meta
  const name = meta['الاسم'] ?? meta.name ?? ''
  const gradeRaw = meta['الصف'] ?? meta.grade ?? ''
  const grade = normalizeGrade(gradeRaw)
  const phone = meta['الهاتف'] ?? meta.phone ?? null

  return {
    id: normalized,
    student_code: normalized,
    name: String(name).trim() || 'طالب',
    grade,
    phone: phone ? String(phone).trim() : null,
  }
}
