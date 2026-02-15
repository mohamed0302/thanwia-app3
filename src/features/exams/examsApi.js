/**
 * الامتحانات — جلب حسب صف الطالب.
 * المصدر: Firebase (ما يضيفه المدرس من لوحة التحكم) أولا، ثم السيرفر، ثم Supabase، ثم تجريبي.
 */
import { get } from 'firebase/database'
import { isFirebaseConfigured, getExamsRef } from '../../lib/firebase'
import { api } from '../../lib/api'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

const CACHE_KEY = 'finapp_exams_v2'

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

  // 1) Firebase مباشرة (مثل الفيديوهات) لضمان ظهور ما يرفعه الأدمن فورًا
  if (isFirebaseConfigured) {
    const examRef = getExamsRef(grade)
    if (examRef) {
      try {
        const snap = await get(examRef)
        const val = snap.val()
        const list = val
          ? Object.entries(val).map(([id, v]) => ({ id, title: v.title || '', url: v.url || '', grade }))
          : []
        setCache(grade, list)
        return list
      } catch (e) {
        console.error('fetchExamsByGrade Firebase:', e)
      }
    }
  }

  // 2) API السيرفر
  const token = localStorage.getItem('finapp_token')
  if (token && token !== 'guest-token') {
    try {
      const res = await api.get(`/exams?grade=${encodeURIComponent(grade)}`)
      const list = res.data?.exams || []
      setCache(grade, list)
      return list
    } catch (_) {}
  }

  // 3) Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('exams').select('id, title, url, grade').eq('grade', grade).order('created_at', { ascending: false })
      if (!error && Array.isArray(data)) {
        setCache(grade, data)
        return data
      }
    } catch (_) {}
  }

  // 4) تجريبي
  const demo = [
    { id: 'balagha-1', title: 'امتحان بلاغة شامل', url: 'https://docs.google.com/forms/d/1HAJKg9oMY3I2edDXgnXix5KVJVORdoSIBVVQWwAXmvA/viewform?hl=ar&pli=1&hl=ar&pli=1&edit_requested=true', grade: '1st_secondary' },
    { id: 'balagha-2', title: 'امتحان بلاغة شامل', url: 'https://docs.google.com/forms/d/1HAJKg9oMY3I2edDXgnXix5KVJVORdoSIBVVQWwAXmvA/viewform?hl=ar&pli=1&hl=ar&pli=1&edit_requested=true', grade: '2nd_secondary' },
    { id: 'balagha-3', title: 'امتحان بلاغة شامل', url: 'https://docs.google.com/forms/d/1HAJKg9oMY3I2edDXgnXix5KVJVORdoSIBVVQWwAXmvA/viewform?hl=ar&pli=1&hl=ar&pli=1&edit_requested=true', grade: '3rd_secondary' },
  ].filter((e) => e.grade === grade)
  setCache(grade, demo)
  return demo
}
