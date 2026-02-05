/**
 * جلب الدرجات والغياب والرسائل من Firebase (نظام latest ali).
 * المسارات: students/{كود}/grades ، absence ، messages — كل عنصر: { text, timestamp }
 */
import { get } from 'firebase/database'
import { isFirebaseConfigured, getStudentChildRef } from '../../lib/firebase'

function parseList(snapshot) {
  const list = []
  const val = snapshot.val()
  if (!val || typeof val !== 'object') return list
  Object.keys(val).forEach((key) => {
    const item = val[key]
    if (item && typeof item === 'object') {
      list.push({
        id: key,
        text: item.text ?? item.content ?? '',
        timestamp: item.timestamp ?? null,
      })
    }
  })
  return list.sort((a, b) => {
    const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0
    const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0
    return tB - tA
  })
}

/**
 * جلب كل رسائل الطالب من Firebase (grades, absence, messages).
 * الطالب يُعرّف بكود الطالب (student_code) وهو نفسه المفتاح في Firebase.
 */
export async function fetchStudentMessagesFromFirebase(studentCode) {
  if (!studentCode || !isFirebaseConfigured) return []

  const result = []

  const gradesRef = getStudentChildRef(studentCode, 'grades')
  const absenceRef = getStudentChildRef(studentCode, 'absence')
  const messagesRef = getStudentChildRef(studentCode, 'messages')

  const [gradesSnap, absenceSnap, messagesSnap] = await Promise.all([
    gradesRef ? get(gradesRef) : Promise.resolve({ val: () => null }),
    absenceRef ? get(absenceRef) : Promise.resolve({ val: () => null }),
    messagesRef ? get(messagesRef) : Promise.resolve({ val: () => null }),
  ])

  const gradesList = gradesRef && gradesSnap?.val ? parseList(gradesSnap) : []
  const absenceList = absenceRef && absenceSnap?.val ? parseList(absenceSnap) : []
  const messagesList = messagesRef && messagesSnap?.val ? parseList(messagesSnap) : []

  gradesList.forEach((m) => result.push({ id: `grade-${m.id}`, type: 'grade', content: m.text, created_at: m.timestamp }))
  absenceList.forEach((m) => result.push({ id: `absence-${m.id}`, type: 'absence', content: m.text, created_at: m.timestamp }))
  messagesList.forEach((m) => result.push({ id: `msg-${m.id}`, type: 'message', content: m.text, created_at: m.timestamp }))

  result.sort((a, b) => {
    const tA = a.created_at ? new Date(a.created_at).getTime() : 0
    const tB = b.created_at ? new Date(b.created_at).getTime() : 0
    return tB - tA
  })

  return result
}
