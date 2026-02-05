/**
 * فيديوهات الشرح — حسب صف الطالب فقط.
 * المصدر: Firebase (من لوحة المدرس) أولاً، ثم Supabase، ثم تجريبي.
 */
import { get } from 'firebase/database'
import { isFirebaseConfigured, getVideosRef } from '../../lib/firebase'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

const CACHE_KEY = 'finapp_videos'

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

/** جلب فيديوهات صف معيّن — الطالب يرى محتواه فقط */
export async function fetchVideosByGrade(grade) {
  if (!grade) return []

  const cached = getCached(grade)
  if (cached) return cached

  // 1) Firebase (ما يضيفه المدرس من لوحة التحكم)
  if (isFirebaseConfigured) {
    const videoRef = getVideosRef(grade)
    if (videoRef) {
      try {
        const snap = await get(videoRef)
        const val = snap.val()
        const list = val ? Object.entries(val).map(([id, v]) => ({ id, title: v.title || '', video_url: v.video_url || '', grade, subject: v.subject || '' })) : []
        setCache(grade, list)
        return list
      } catch (e) {
        console.error('fetchVideosByGrade Firebase:', e)
      }
    }
  }

  // 2) Supabase
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('videos').select('id, title, video_url, grade, subject').eq('grade', grade).order('created_at', { ascending: false })
    if (!error && Array.isArray(data)) {
      setCache(grade, data)
      return data
    }
  }

  // 3) تجريبي
  const demo = [
    { id: '1', title: 'الدرس الأول - الجبر', video_url: 'https://www.youtube.com', grade: '1st_secondary', subject: 'رياضيات' },
    { id: '2', title: 'الدرس الثاني - الهندسة', video_url: 'https://www.youtube.com', grade: '1st_secondary', subject: 'رياضيات' },
  ].filter((v) => v.grade === grade)
  setCache(grade, demo)
  return demo
}
