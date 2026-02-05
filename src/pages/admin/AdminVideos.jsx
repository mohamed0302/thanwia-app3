import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { getAdminErrorMessage } from '../../lib/adminError'

const GRADES = [
  { value: '1st_secondary', label: 'أولى ثانوي' },
  { value: '2nd_secondary', label: 'ثانية ثانوي' },
  { value: '3rd_secondary', label: 'ثالثة ثانوي' },
]

export default function AdminVideos() {
  const [grade, setGrade] = useState('1st_secondary')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', video_url: '', subject: '' })

  const load = () => {
    setLoading(true)
    setError('')
    api.get(`/admin/videos?grade=${grade}`)
      .then((r) => setVideos(r.data.videos || []))
      .catch((e) => setError(getAdminErrorMessage(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [grade])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.video_url.trim()) {
      setError('العنوان ورابط الفيديو مطلوبان')
      return
    }
    setAdding(true)
    setError('')
    api.post('/admin/videos', { grade, title: form.title.trim(), video_url: form.video_url.trim(), subject: form.subject.trim() })
      .then(() => {
        setForm({ title: '', video_url: '', subject: '' })
        load()
      })
      .catch((e) => setError(getAdminErrorMessage(e)))
      .finally(() => setAdding(false))
  }

  const handleDelete = (id) => {
    if (!confirm('حذف هذا الفيديو؟')) return
    api.delete(`/admin/videos/${id}?grade=${grade}`)
      .then(load)
      .catch((e) => setError(getAdminErrorMessage(e)))
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-slate-800">إدارة الفيديوهات</h2>

      <div className="flex flex-wrap gap-2 items-center">
        <label className="text-slate-600 text-sm">الصف:</label>
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          {GRADES.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">{error}</div>}

      <section className="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800 mb-3">إضافة فيديو جديد</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-slate-600 text-sm mb-1">العنوان</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="مثال: الدرس الأول - الجبر"
            />
          </div>
          <div>
            <label className="block text-slate-600 text-sm mb-1">رابط الفيديو</label>
            <input
              type="url"
              value={form.video_url}
              onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-slate-600 text-sm mb-1">المادة (اختياري)</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="رياضيات"
            />
          </div>
          <button type="submit" disabled={adding} className="btn-primary py-2 px-4 disabled:opacity-50">
            {adding ? 'جاري الإضافة...' : 'إضافة الفيديو'}
          </button>
        </form>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800 mb-3">قائمة الفيديوهات ({GRADES.find((g) => g.value === grade)?.label})</h3>
        {loading ? (
          <p className="text-slate-500 text-sm">جاري التحميل...</p>
        ) : videos.length === 0 ? (
          <p className="text-slate-500 text-sm">لا توجد فيديوهات لهذا الصف</p>
        ) : (
          <ul className="space-y-2">
            {videos.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
                <div className="min-w-0 text-right">
                  <p className="font-medium text-slate-800 truncate">{v.title}</p>
                  {v.subject && <p className="text-slate-500 text-xs">{v.subject}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(v.id)}
                  className="shrink-0 text-red-600 hover:text-red-700 text-sm px-2 py-1"
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
