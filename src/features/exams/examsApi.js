/**
 * الامتحانات — جلب حسب صف الطالب. مصدر: Firebase أولاً، ثم Supabase، ثم تجريبي.
 */
import { get } from 'firebase/database'
import { isFirebaseConfigured, getExamsRef } from '../../lib/firebase'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

const CACHE_KEY = 'finapp_exams'

function getCached(grade) {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, at, grade: g } = JSON.parse(raw)
    if (g !== grade || Date.now() - at > 10 * 60 * 1000) return null
    return data
  } catch {
    return null
  }
}

function setCache(grade, data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, at: Date.now(), grade }))
  } catch (_) {}
}

/** جلب امتحانات صف معيّن فقط */
export async function fetchExamsByGrade(grade) {
  if (!grade) return []

  const cached = getCached(grade)
  if (cached) return cached

  if (isFirebaseConfigured) {
    try {
      const examRef = getExamsRef(grade)
      if (examRef) {
        const snap = await get(examRef)
        const val = snap.val()
        const list = val ? Object.entries(val).map(([id, v]) => ({ id, title: v.title || '', url: v.url || '', grade })) : []
        if (list.length > 0) {
          setCache(grade, list)
          return list
        }
      }
    } catch (_) {}
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('exams').select('id, title, url, grade').eq('grade', grade).order('created_at', { ascending: false })
      if (!error && Array.isArray(data) && data.length > 0) {
        setCache(grade, data)
        return data
      }
    } catch (_) {}
  }

  const demo = [
    { id: '1', title: 'امتحان رياضيات - أولى ثانوي', url: 'https://www.youtube.com', grade: '1st_secondary' },
    { id: '2', title: 'امتحان عربي - أولى ثانوي', url: 'https://www.youtube.com', grade: '1st_secondary' },
  ].filter((e) => e.grade === grade)
  setCache(grade, demo)
  return demo
}
