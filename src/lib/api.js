/**
 * عميل HTTP للتواصل مع الـ Backend
 * يستخدم config.json أو VITE_API_URL أو /api
 */
import { getApiBase } from './config'

function getToken() {
  return localStorage.getItem('finapp_token')
}

const demoData = {
  '/videos': { videos: [{ id: '1', title: 'الدرس الأول', description: 'مقدمة في المادة', url: 'https://www.youtube.com' }] },
  '/booking': { bookings: [{ id: '1', studentName: 'أحمد محمد', date: '2025-02-05', time: '10:00', status: 'مؤكد', note: '' }] },
  '/grades': { records: [{ id: '1', studentName: 'أحمد محمد', absenceCount: 1, grade: '85' }, { id: '2', studentName: 'فاطمة علي', absenceCount: 4, grade: '72' }] },
}

export const api = {
  async request(method, path, data = null) {
    const BASE = await getApiBase()
    const token = getToken()
    const url = `${BASE}${path}`
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    }
    if (token) opts.headers.Authorization = `Bearer ${token}`
    if (data && method !== 'GET') opts.body = JSON.stringify(data)
    try {
      const res = await fetch(url, opts)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const err = new Error(body.message || 'خطأ في الطلب')
        err.response = { data: body, status: res.status }
        throw err
      }
      return { data: body }
    } catch (err) {
      if ((token === 'demo-token' || token === 'guest-token') && method === 'GET' && demoData[path]) {
        return { data: demoData[path] }
      }
      throw err
    }
  },
  get(path) {
    return this.request('GET', path)
  },
  post(path, data) {
    return this.request('POST', path, data)
  },
  put(path, data) {
    return this.request('PUT', path, data)
  },
  delete(path) {
    return this.request('DELETE', path)
  },
}
