import { useState, useEffect } from 'react'
import { fetchExams, addExam, deleteExam } from '../../features/admin/firebaseAdminApi'

const GRADES = [
  { value: '1st_secondary', label: 'أولى ثانوي' },
  { value: '2nd_secondary', label: 'ثانية ثانوي' },
  { value: '3rd_secondary', label: 'ثالثة ثانوي' },
]

export default function AdminExams() {
  const [grade, setGrade] = useState('1st_secondary')
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', url: '' })

  const load = () => {
    setLoading(true)
    setError('')
    fetchExams(grade)
      .then(setExams)
      .catch((e) => setError(e.message || 'تعذر التحميل'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [grade])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim()) {
      setError('العنوان ورابط الامتحان مطلوبان')
      return
    }
    setAdding(true)
    setError('')
    addExam(grade, { title: form.title.trim(), url: form.url.trim() })
      .then(() => {
        setForm({ title: '', url: '' })
        load()
      })
      .catch((e) => setError(e.message || 'تعذر الإضافة'))
      .finally(() => setAdding(false))
  }

  const handleDelete = (id) => {
    if (!confirm('حذف هذا الامتحان؟')) return
    deleteExam(grade, id)
      .then(load)
      .catch((e) => setError(e.message || 'تعذر الحذف'))
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-slate-800">إدارة روابط الامتحانات</h2>

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
        <h3 className="font-semibold text-slate-800 mb-3">إضافة امتحان جديد</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-slate-600 text-sm mb-1">عنوان الامتحان</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="مثال: امتحان رياضيات - نصف الفصل"
            />
          </div>
          <div>
            <label className="block text-slate-600 text-sm mb-1">رابط الامتحان</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <button type="submit" disabled={adding} className="btn-primary py-2 px-4 disabled:opacity-50">
            {adding ? 'جاري الإضافة...' : 'إضافة الامتحان'}
          </button>
        </form>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800 mb-3">قائمة الامتحانات ({GRADES.find((g) => g.value === grade)?.label})</h3>
        {loading ? (
          <p className="text-slate-500 text-sm">جاري التحميل...</p>
        ) : exams.length === 0 ? (
          <p className="text-slate-500 text-sm">لا توجد امتحانات لهذا الصف</p>
        ) : (
          <ul className="space-y-2">
            {exams.map((exam) => (
              <li key={exam.id} className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
                <div className="min-w-0 text-right">
                  <p className="font-medium text-slate-800 truncate">{exam.title}</p>
                  <p className="text-slate-500 text-xs truncate">{exam.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(exam.id)}
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
